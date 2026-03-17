import React from 'react'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>VE</div>
      <div className={styles.title}>
        <h1>ADUANERO.AI · VENEZUELA</h1>
        <p>Motor de Clasificación Arancelaria NANDINA · Decreto N° 2.647</p>
      </div>
      <div className={styles.badge}>SENIAT · ZONE</div>
    </header>
  )
}
