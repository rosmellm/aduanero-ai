import React, { useState, useEffect } from 'react'
import { getPermits, savePermit, deletePermit, getExpiringPermits } from '../utils/storage.js'
import { PERMIT_TYPES } from '../data/countries.js'
import styles from './AgendaPanel.module.css'

export default function AgendaPanel({ visible, onClose }) {
  const [permits, setPermits] = useState([])
  const [form, setForm] = useState({ type: '', custom: '', expiry: '', mercancia: '', notes: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (visible) setPermits(getPermits()) }, [visible])

  function handleSave() {
    if (!form.type || !form.expiry) return
    savePermit({
      type: form.custom || form.type,
      expiry: form.expiry,
      mercancia: form.mercancia,
      notes: form.notes,
    })
    setPermits(getPermits())
    setForm({ type: '', custom: '', expiry: '', mercancia: '', notes: '' })
    setShowForm(false)
  }

  function handleDelete(id) {
    deletePermit(id)
    setPermits(getPermits())
  }

  function getDaysLeft(expiry) {
    const diff = new Date(expiry) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  function statusColor(days) {
    if (days < 0) return '#ef4444'
    if (days <= 15) return '#f59e0b'
    if (days <= 30) return '#eab308'
    return 'var(--green)'
  }

  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>AGENDA DE PERMISOS</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.addBtn} onClick={() => setShowForm(s => !s)}>+ Nuevo</button>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        {showForm && (
          <div className={styles.form}>
            <div className={styles.formTitle}>Registrar permiso / certificado</div>
            <div className={styles.formGroup}>
              <label>Tipo de permiso</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={styles.inp}>
                <option value="">Seleccione...</option>
                {PERMIT_TYPES.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                <option value="__custom">Otro (especifique)</option>
              </select>
            </div>
            {form.type === '__custom' && (
              <div className={styles.formGroup}>
                <label>Descripción personalizada</label>
                <input value={form.custom} onChange={e => setForm(f => ({ ...f, custom: e.target.value }))} className={styles.inp} placeholder="Ej: Permiso especial..." />
              </div>
            )}
            <div className={styles.formGroup}>
              <label>Mercancía asociada</label>
              <input value={form.mercancia} onChange={e => setForm(f => ({ ...f, mercancia: e.target.value }))} className={styles.inp} placeholder="Ej: Laptop Dell 8471.30.00.00" />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha de vencimiento</label>
              <input type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} className={styles.inp} />
            </div>
            <div className={styles.formGroup}>
              <label>Notas</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={styles.inp} placeholder="Observaciones..." />
            </div>
            <button className={styles.saveBtn} onClick={handleSave}>Guardar permiso</button>
          </div>
        )}

        <div className={styles.list}>
          {permits.length === 0 ? (
            <div className={styles.empty}>No hay permisos registrados.<br />Toque "+ Nuevo" para agregar.</div>
          ) : (
            permits.map(p => {
              const days = getDaysLeft(p.expiry)
              const color = statusColor(days)
              return (
                <div key={p.id} className={styles.item} style={{ borderLeft: `3px solid ${color}` }}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemType}>{p.type}</span>
                    <span className={styles.daysLeft} style={{ color }}>{days < 0 ? 'VENCIDO' : days === 0 ? 'HOY' : `${days}d`}</span>
                  </div>
                  {p.mercancia && <div className={styles.itemMercancia}>{p.mercancia}</div>}
                  <div className={styles.itemExpiry}>Vence: {new Date(p.expiry).toLocaleDateString('es-VE')}</div>
                  {p.notes && <div className={styles.itemNotes}>{p.notes}</div>}
                  <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Eliminar</button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
