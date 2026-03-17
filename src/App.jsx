import React, { useState, useRef, useEffect } from 'react'
import Header from './components/Header.jsx'
import MessageBubble from './components/MessageBubble.jsx'
import InputBar from './components/InputBar.jsx'
import { callAduaneroAI, loadArancelData } from './utils/api.js'
import styles from './App.module.css'

function WelcomeBubble({ arancelReady }) {
  return (
    <div style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.7', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderTopLeftRadius: '3px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Sistema activo</div>
      Bienvenido al <b>Motor de Clasificación Arancelaria de Venezuela</b>. Configurado bajo el <b>Decreto N° 4.944</b> — Gaceta Oficial N° 6.804 Extraordinario del 24 de abril de 2024.
      <br /><br />
      <span style={{ color: arancelReady ? 'var(--green)' : 'var(--gold)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
        {arancelReady ? '● Base arancelaria cargada: 11.915 subpartidas NANDINA' : '○ Cargando base arancelaria...'}
      </span>
      <br /><br />
      Escriba el nombre de cualquier mercancía para obtener su clasificación arancelaria con fundamento legal. Si incluye datos FOB/Flete/Seguro, calculo la obligación tributaria proyectada.
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
        {['Nombre del producto → clasificación NANDINA a 10 dígitos', 'Incluya USD FOB + Flete + Seguro para liquidación', 'Datos extraídos directamente del PDF oficial'].map((t, i) => (
          <li key={i} style={{ padding: '3px 0', color: 'var(--text2)', fontSize: '12px' }}>
            <span style={{ color: 'var(--gold)' }}>▸ </span>{t}
          </li>
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
  const bottomRef = useRef(null)

  useEffect(() => {
    loadArancelData().then(d => {
      if (d && d.entries) setArancelReady(true)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(text) {
    if (loading) return
    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    const newHistory = [...history, { role: 'user', content: text }]
    setHistory(newHistory)
    setLoading(true)
    try {
      const { parsed, raw } = await callAduaneroAI(newHistory)
      setHistory(prev => [...prev, { role: 'assistant', content: raw }])
      setMessages(prev => [...prev, { role: 'assistant', data: parsed }])
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
        }
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.msgs}>
        <div className={styles.msgRow}>
          <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
          <WelcomeBubble arancelReady={arancelReady} />
        </div>
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} data={m.data} />
        ))}
        {loading && <MessageBubble isTyping />}
        <div ref={bottomRef} />
      </div>
      <InputBar onSend={handleSend} loading={loading} />
    </div>
  )
}
