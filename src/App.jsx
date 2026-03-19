import React, { useState, useRef, useEffect } from 'react'
import Header from './components/Header.jsx'
import MessageBubble from './components/MessageBubble.jsx'
import InputBar from './components/InputBar.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import { callAduaneroAI, loadArancelData } from './utils/api.js'
import { saveToHistory } from './utils/storage.js'
import styles from './App.module.css'

function WelcomeBubble({ arancelReady }) {
  return (
    <div className={styles.welcomeBubble}>
      <div className={styles.welcomeTitle}>Sistema activo</div>
      Bienvenido al <strong>Motor de Clasificación Arancelaria de Venezuela</strong>. Configurado bajo el <strong>Decreto N° 4.944</strong> — Gaceta Oficial N° 6.804 Extraordinario del 24 de abril de 2024.
      <br /><br />
      <span style={{ color: arancelReady ? 'var(--green)' : 'var(--gold3)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
        {arancelReady ? '● Base arancelaria cargada: 11.915 subpartidas NANDINA' : '○ Cargando base arancelaria...'}
      </span>
      <br /><br />
      Escriba el nombre de una mercancía, adjunte una <strong>factura PDF</strong> o <strong>imagen</strong> para clasificación automática. Si sube una factura con varias mercancías, clasifico todas.
      <ul className={styles.welcomeList}>
        {['Nombre del producto → clasificación NANDINA a 10 dígitos','Factura con múltiples ítems → clasificación simultánea','FOB + Flete + Seguro → liquidación tributaria completa','Historial de consultas guardado localmente'].map((t,i) => (
          <li key={i}><span style={{ color: 'var(--gold2)' }}>▸ </span>{t}</li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [arancelReady, setArancelReady] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [showHistory, setShowHistory] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    loadArancelData().then(d => { if (d && d.entries) setArancelReady(true) })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  async function handleSend(text, files = []) {
    if (loading || (!text.trim() && files.length === 0)) return
    const userMsg = { role: 'user', text, files }
    setMessages(prev => [...prev, userMsg])
    const newHistory = [...history, { role: 'user', content: text }]
    setHistory(newHistory)
    setLoading(true)
    try {
      const { parsed, raw } = await callAduaneroAI(newHistory, files)
      setHistory(prev => [...prev, { role: 'assistant', content: raw }])
      setMessages(prev => [...prev, { role: 'assistant', data: parsed }])

      // Save to history
      if (parsed && parsed.codigo && parsed.codigo !== '—') {
        saveToHistory({
          query: text,
          mercancia: parsed.mercancia,
          codigo: parsed.codigo,
          ad_valorem: parsed.ad_valorem,
          regimen_legal: parsed.regimen_legal,
          tiene_valoracion: parsed.tiene_valoracion,
          total_tributos: parsed.valoracion?.total_tributos,
          total_importacion: parsed.valoracion?.total_importacion,
        })
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        data: {
          necesita_info: false,
          observaciones: ['Error: ' + err.message],
          mercancia: '—', codigo: '—',
          rgi_justificacion: null, nota_seccion: null,
          nota_capitulo: null, notas_explicativas: null,
          regimen_legal: [], ad_valorem: '—',
          tasa_aduanera: '1%', iva: '16%',
          tiene_valoracion: false, valoracion: null,
          items: [], pregunta_final: null,
        }
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleFollowup(text) {
    handleSend(text, [])
  }

  function handleHistoryReload(query) {
    handleSend(query, [])
  }

  return (
    <div className={styles.app}>
      <Header theme={theme} onToggleTheme={toggleTheme} onToggleHistory={() => setShowHistory(true)} />

      <HistoryPanel
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        onReload={handleHistoryReload}
      />

      <div className={styles.msgs}>
        <div className={styles.msgRow}>
          <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
          <WelcomeBubble arancelReady={arancelReady} />
        </div>

        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            role={m.role}
            text={m.text}
            data={m.data}
            onSendFollowup={handleFollowup}
          />
        ))}

        {loading && <MessageBubble isTyping />}
        <div ref={bottomRef} />
      </div>

      <InputBar onSend={handleSend} loading={loading} />
    </div>
  )
}
