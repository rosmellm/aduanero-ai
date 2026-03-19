import React, { useRef, useState } from 'react'
import { QUICK_QUERIES } from '../constants.js'
import styles from './InputBar.module.css'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']

function FileChip({ file, onRemove }) {
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
  const isImg = file.type.startsWith('image/')
  const icon = isPdf ? '📄' : isImg ? '🖼' : '📎'
  const size = (file.size / 1024).toFixed(0) + ' KB'
  return (
    <div className={styles.chip}>
      <span className={styles.chipIcon}>{icon}</span>
      <span className={styles.chipName}>{file.name.slice(0, 24)}{file.name.length > 24 ? '…' : ''}</span>
      <span className={styles.chipSize}>{size}</span>
      <button className={styles.chipRemove} onClick={() => onRemove(file.name)}>×</button>
    </div>
  )
}

export default function InputBar({ onSend, loading }) {
  const ref = useRef(null)
  const fileRef = useRef(null)
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  function autoResize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  function addFiles(incoming) {
    const valid = Array.from(incoming).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return ALLOWED_TYPES.includes(f.type) || ALLOWED_EXT.includes(ext)
    })
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...valid.filter(f => !names.has(f.name))].slice(0, 5)
    })
  }

  function removeFile(name) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  function submit() {
    const val = ref.current?.value?.trim()
    if ((!val && files.length === 0) || loading) return
    const text = val || (files.length > 0 ? 'Analiza este documento y clasifica las mercancías.' : '')
    onSend(text, files)
    ref.current.value = ''
    ref.current.style.height = 'auto'
    setFiles([])
  }

  function quickSend(query) {
    if (loading) return
    onSend(query, [])
  }

  return (
    <div
      className={`${styles.footer} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div className={styles.dropOverlay}>Suelta aquí el archivo</div>
      )}

      <div className={styles.quickBtns}>
        {QUICK_QUERIES.map(q => (
          <button key={q.label} className={styles.qb} onClick={() => quickSend(q.query)} disabled={loading}>{q.label}</button>
        ))}
      </div>

      {files.length > 0 && (
        <div className={styles.chips}>
          {files.map(f => <FileChip key={f.name} file={f} onRemove={removeFile} />)}
        </div>
      )}

      <div className={styles.inputRow}>
        <button
          className={styles.attach}
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          title="Adjuntar PDF o imagen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          multiple
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files.length) addFiles(e.target.files); e.target.value = '' }}
        />
        <textarea
          ref={ref}
          className={styles.input}
          placeholder="Describa la mercancía o adjunte un documento / imagen..."
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
        Soporta PDF · JPG · PNG · Arrastre archivos aquí · NANDINA 10 dígitos · Art. 3 RDLOA
      </div>
    </div>
  )
}
