import React, { useState, useRef, useEffect } from 'react'
import Header from './components/Header.jsx'
import MessageBubble from './components/MessageBubble.jsx'
import InputBar from './components/InputBar.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import ToolsPanel from './components/ToolsPanel.jsx'
import AgendaPanel from './components/AgendaPanel.jsx'
import { callAduaneroAI, loadArancelData } from './utils/api.js'
import { saveToHistory, getExpiringPermits } from './utils/storage.js'
import styles from './App.module.css'

function WelcomeBubble({ arancelReady, expiringCount }) {
  return (
    <div className={styles.welcomeBubble}>
      <div className={styles.welcomeTitle}>Sistema activo — v4.0</div>
      Bienvenido al <strong>Motor de Clasificación Arancelaria de Venezuela</strong>. Configurado bajo el <strong>Decreto N° 4.944</strong> — Gaceta Oficial N° 6.804 Extraordinario del 24 de abril de 2024.
      <br /><br />
      <span style={{ color: arancelReady ? 'var(--green)' : 'var(--gold3)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
        {arancelReady ? '● 11.915 subpartidas NANDINA cargadas del Decreto oficial' : '○ Cargando base arancelaria...'}
      </span>
      {expiringCount > 0 && (
        <div style={{ marginTop: '8px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: '#fca5a5' }}>
          ⚠ Tiene {expiringCount} permiso{expiringCount > 1 ? 's' : ''} próximo{expiringCount > 1 ? 's' : ''} a vencer — revise la Agenda
        </div>
      )}
      <br />
      <ul className={styles.welcomeList}>
        {[
          'Clasificación NANDINA a 10 dígitos con fundamento legal',
          'Facturas con múltiples ítems → clasificación simultánea',
          'FOB + Flete + Seguro → liquidación completa con total importación',
          'Generación de PDF del expediente + exportación Excel',
          'Calculadora inversa · Simulador de escenarios · Tasa BCV',
          'Agenda de permisos con alertas de vencimiento',
          'Historial completo de consultas',
        ].map((t, i) => <li key={i}><span style={{ color: 'var(--gold2)' }}>▸ </span>{t}</li>)}
      </ul>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [arancelReady, setArancelReady] = useState(false)
  const [arancelData, setArancelData] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [showHistory, setShowHistory] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)
  const [expiringCount, setExpiringCount] = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    loadArancelData().then(d => {
      if (d && d.entries) { setArancelReady(true); setArancelData(d) }
    })
    setExpiringCount(getExpiringPermits(30).length)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text, files = []) {
    if (loading || (!text.trim() && files.length === 0)) return
    setMessages(prev => [...prev, { role: 'user', text, files }])
    const newHistory = [...history, { role: 'user', content: text }]
    setHistory(newHistory)
    setLoading(true)
    try {
      const { parsed, raw } = await callAduaneroAI(newHistory, files)
      setHistory(prev => [...prev, { role: 'assistant', content: raw }])
      setMessages(prev => [...prev, { role: 'assistant', data: parsed }])
      if (parsed?.codigo && parsed.codigo !== '—') {
        saveToHistory({
          query: text, mercancia: parsed.mercancia, codigo: parsed.codigo,
          ad_valorem: parsed.ad_valorem, regimen_legal: parsed.regimen_legal,
          tiene_valoracion: parsed.tiene_valoracion,
          total_tributos: parsed.valoracion?.total_tributos,
          total_importacion: parsed.valoracion?.total_importacion,
        })
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        data: {
          necesita_info: false, items: [], pregunta_final: null,
          observaciones: ['Error: ' + err.message],
          mercancia: '—', codigo: '—', rgi_justificacion: null,
          nota_seccion: null, nota_capitulo: null, notas_explicativas: null,
          regimen_legal: [], ad_valorem: '—', tasa_aduanera: '1%', iva: '16%',
          tiene_valoracion: false, valoracion: null,
        }
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onToggleHistory={() => setShowHistory(true)}
        onToggleTools={() => setShowTools(true)}
        onToggleAgenda={() => setShowAgenda(true)}
        expiringCount={expiringCount}
      />

      <HistoryPanel visible={showHistory} onClose={() => setShowHistory(false)} onReload={q => { setShowHistory(false); handleSend(q) }} />
      <ToolsPanel visible={showTools} onClose={() => setShowTools(false)} arancelData={arancelData} onSendMessage={t => { setShowTools(false); handleSend(t) }} />
      <AgendaPanel visible={showAgenda} onClose={() => { setShowAgenda(false); setExpiringCount(getExpiringPermits(30).length) }} />

      <div className={styles.msgs}>
        <div className={styles.msgRow}>
          <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
          <WelcomeBubble arancelReady={arancelReady} expiringCount={expiringCount} />
        </div>
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} data={m.data}
            onSendFollowup={t => handleSend(t)} arancelData={arancelData} />
        ))}
        {loading && <MessageBubble isTyping />}
        <div ref={bottomRef} />
      </div>

      <InputBar onSend={handleSend} loading={loading} />
    </div>
  )
}
