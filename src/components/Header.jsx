import React from 'react'
import styles from './Header.module.css'

export default function Header({ theme, onToggleTheme, onToggleHistory, onToggleTools, onToggleAgenda, expiringCount }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>VE</div>
      <div className={styles.title}>
        <h1>ADUANERO.AI · VENEZUELA</h1>
        <p>Motor de Clasificación Arancelaria NANDINA · Decreto N° 4.944</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={onToggleAgenda} title="Agenda de permisos">
          {expiringCount > 0 && <span className={styles.alertDot}>{expiringCount}</span>}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
        <button className={styles.iconBtn} onClick={onToggleTools} title="Herramientas">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.36 1.56M2.57 6.49A10 10 0 0 1 4 4.93M19.07 19.07a10 10 0 0 1-1.56 1.36M6.49 21.43A10 10 0 0 1 4.93 20"/>
          </svg>
        </button>
        <button className={styles.iconBtn} onClick={onToggleHistory} title="Historial">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
        <button className={styles.iconBtn} onClick={onToggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
          {theme === 'dark'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </div>
    </header>
  )
}
