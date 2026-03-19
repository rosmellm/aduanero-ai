import React from 'react'
import { getHistory, clearHistory, deleteHistoryEntry } from '../utils/storage.js'
import styles from './HistoryPanel.module.css'

export default function HistoryPanel({ visible, onClose, onReload }) {
  const [history, setHistory] = React.useState([])

  React.useEffect(() => {
    if (visible) setHistory(getHistory())
  }, [visible])

  function handleDelete(id) {
    deleteHistoryEntry(id)
    setHistory(getHistory())
  }

  function handleClear() {
    clearHistory()
    setHistory([])
  }

  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>HISTORIAL DE CONSULTAS</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {history.length > 0 && <button className={styles.clearBtn} onClick={handleClear}>Limpiar</button>}
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className={styles.empty}>No hay consultas registradas aún.</div>
        ) : (
          <div className={styles.list}>
            {history.map(e => (
              <div key={e.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemCode}>{e.codigo || '—'}</span>
                  <span className={styles.itemDate}>{new Date(e.date).toLocaleDateString('es-VE')}</span>
                </div>
                <div className={styles.itemMercancia}>{e.mercancia || e.query}</div>
                <div className={styles.itemTags}>
                  {e.ad_valorem && <span className={styles.itemTag}>Ad Val: {e.ad_valorem}</span>}
                  {e.tiene_valoracion && e.total_tributos && (
                    <span className={styles.itemTag}>Trib: USD {Number(e.total_tributos).toLocaleString('es-VE',{minimumFractionDigits:2})}</span>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.reloadBtn} onClick={() => { onReload(e.query); onClose() }}>Repetir consulta</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(e.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
