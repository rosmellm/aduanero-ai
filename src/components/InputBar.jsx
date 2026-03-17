import React, { useRef } from 'react'
import { QUICK_QUERIES } from '../constants.js'
import styles from './InputBar.module.css'

export default function InputBar({ onSend, loading }) {
  const ref = useRef(null)

  function autoResize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const val = ref.current?.value?.trim()
    if (!val || loading) return
    onSend(val)
    ref.current.value = ''
    ref.current.style.height = 'auto'
  }

  function quickSend(query) {
    if (loading) return
    onSend(query)
  }

  return (
    <div className={styles.footer}>
      <div className={styles.quickBtns}>
        {QUICK_QUERIES.map((q) => (
          <button key={q.label} className={styles.qb} onClick={() => quickSend(q.query)} disabled={loading}>
            {q.label}
          </button>
        ))}
      </div>
      <div className={styles.inputRow}>
        <textarea
          ref={ref}
          className={styles.input}
          placeholder="Describa la mercancía... (ej: 'motor diesel 150HP para camión')"
          rows={1}
          onInput={autoResize}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button className={styles.send} onClick={submit} disabled={loading}>
          {loading ? '...' : 'CONSULTAR'}
        </button>
      </div>
      <div className={styles.footerNote}>
        Motor configurado · NANDINA 10 dígitos · RGI Sistema Armonizado · Art. 3 RDLOA
      </div>
    </div>
  )
}
