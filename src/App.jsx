import React, { useState, useRef, useEffect } from 'react'
import Header from './components/Header.jsx'
import MessageBubble from './components/MessageBubble.jsx'
import InputBar from './components/InputBar.jsx'
import { callAduaneroAI } from './utils/api.js'
import styles from './App.module.css'

const WELCOME = {
  role: 'assistant',
  data: {
    mercancia: null,
    necesita_info: false,
    _welcome: true,
  },
  text: null,
}

function WelcomeBubble() {
  return (
    <div style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.7', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderTopLeftRadius: '3px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Sistema activo</div>
      Bienvenido al <strong>Motor de Clasificación Arancelaria de Venezuela</strong>. Estoy configurado bajo el Decreto N° 2.647 (Arancel de Aduanas vigente) y la nomenclatura NANDINA a 10 dígitos.
      <br /><br />
      Puede consultarme directamente con el nombre de una mercancía — clasifico, fundamento la RGI aplicada, y emito el diagnóstico legal completo. Si provee datos financieros (FOB / Flete / Seguro), también calculo la obligación tributaria proyectada.
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
        {['Escriba solo el nombre del producto para clasificarlo', 'Incluya USD FOB + Flete + Seguro para valoración', 'Indique uso, material y presentación si desea mayor precisión'].map((t, i) => (
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
  const bottomRef = useRef(null)

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
          observaciones: [`Error: ${err.message}`],
          mercancia: '—',
          codigo: '—',
          rgi_justificacion: null,
          nota_seccion: null,
          nota_capitulo: null,
          notas_explicativas: null,
          regimen_legal: [],
          ad_valorem: '—',
          tasa_aduanera: '1%',
          iva: '16%',
          tiene_valoracion: false,
          valoracion: null,
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
        {/* Welcome message */}
        <div className={styles.msgRow}>
          <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
          <WelcomeBubble />
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
