import React from 'react'
import { fmtCurrency } from '../utils/format.js'
import styles from './MessageBubble.module.css'

function AiBubble({ data }) {
  if (data.necesita_info && data.preguntas?.length > 0) {
    return (
      <div className={styles.bubble}>
        <div className={styles.sectionTitle}>Información requerida</div>
        <p className={styles.intro}>
          Para aplicar correctamente las Notas Legales del Sistema Armonizado, requiero precisar los
          siguientes puntos sobre la mercancía <strong>{data.mercancia || 'declarada'}</strong>:
        </p>
        <ul className={styles.qList}>
          {data.preguntas.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </div>
    )
  }

  return (
    <div className={styles.bubble}>
      {/* DIAGNÓSTICO */}
      <div className={styles.sectionTitle}>📄 Diagnóstico Técnico Aduanero</div>
      <div className={styles.mercancia}>
        <span className={styles.label}>Mercancía:</span>
        <strong>{data.mercancia || '—'}</strong>
      </div>
      <div className={styles.hsCode}>{data.codigo || '0000.00.00.00'}</div>
      <div className={styles.hsDesc}>{data.descripcion_codigo || ''}</div>

      <div className={styles.tagRow}>
        <span className={`${styles.tag} ${styles.tagGreen}`}>Ad Valorem: {data.ad_valorem || '—'}</span>
        <span className={`${styles.tag} ${styles.tagGold}`}>T. Aduanera: {data.tasa_aduanera || '1%'}</span>
        <span className={`${styles.tag} ${styles.tagCyan}`}>IVA: {data.iva || '16%'}</span>
      </div>

      {data.regimen_legal?.length > 0 && (
        <div className={styles.tagRow}>
          {data.regimen_legal.map((r, i) => (
            <span key={i} className={`${styles.tag} ${styles.tagCyan}`}>{r}</span>
          ))}
        </div>
      )}

      <hr className={styles.divider} />

      {/* SUSTENTO LEGAL */}
      <div className={styles.sectionTitle}>🔬 Sustento Legal — Análisis Técnico</div>

      {data.rgi_justificacion && (
        <div className={styles.ruleBox}>
          <strong>{data.rgi_regla || 'RGI 1'}:</strong> {data.rgi_justificacion}
        </div>
      )}
      {data.nota_seccion && (
        <div className={styles.legalNote}>
          <strong>Nota de Sección:</strong> {data.nota_seccion}
        </div>
      )}
      {data.nota_capitulo && (
        <div className={styles.legalNote}>
          <strong>Nota de Capítulo:</strong> {data.nota_capitulo}
        </div>
      )}
      {data.notas_explicativas && (
        <div className={styles.ruleBox}>
          <strong>Notas Explicativas SA:</strong> {data.notas_explicativas}
        </div>
      )}

      {/* VALORACIÓN */}
      {data.tiene_valoracion && data.valoracion && (
        <>
          <hr className={styles.divider} />
          <div className={styles.sectionTitle}>💰 Valoración y Liquidación Proyectada</div>
          <table className={styles.valTable}>
            <tbody>
              <tr><td>Valor FOB</td><td>{fmtCurrency(data.valoracion.fob, data.valoracion.moneda)}</td></tr>
              <tr><td>Flete</td><td>{fmtCurrency(data.valoracion.flete, data.valoracion.moneda)}</td></tr>
              <tr><td>Seguro</td><td>{fmtCurrency(data.valoracion.seguro, data.valoracion.moneda)}</td></tr>
              <tr className={styles.totalRow}><td>Base Imponible (CIF)</td><td>{fmtCurrency(data.valoracion.cif, data.valoracion.moneda)}</td></tr>
              <tr><td>Ad Valorem ({data.ad_valorem})</td><td>{fmtCurrency(data.valoracion.ad_valorem_monto, data.valoracion.moneda)}</td></tr>
              <tr><td>Tasa Aduanera (1%)</td><td>{fmtCurrency(data.valoracion.tasa_aduanera_monto, data.valoracion.moneda)}</td></tr>
              <tr><td>Base Gravada IVA</td><td>{fmtCurrency(data.valoracion.base_iva, data.valoracion.moneda)}</td></tr>
              <tr><td>IVA (16%)</td><td>{fmtCurrency(data.valoracion.iva_monto, data.valoracion.moneda)}</td></tr>
              <tr className={styles.totalRow}><td>TOTAL TRIBUTOS PROYECTADOS</td><td>{fmtCurrency(data.valoracion.total_tributos, data.valoracion.moneda)}</td></tr>
            </tbody>
          </table>
          {data.valoracion.alerta_valoracion && (
            <div className={styles.alertaBox}>
              <strong>Duda Razonable:</strong> {data.valoracion.alerta_valoracion}
            </div>
          )}
        </>
      )}

      {/* OBSERVACIONES */}
      {data.observaciones?.length > 0 && (
        <>
          <hr className={styles.divider} />
          <div className={styles.sectionTitle}>⚠️ Observaciones y Alertas</div>
          {data.observaciones.map((o, i) => (
            <div key={i} className={styles.alertaBox}>{o}</div>
          ))}
        </>
      )}
    </div>
  )
}

export default function MessageBubble({ role, text, data, isTyping }) {
  if (isTyping) {
    return (
      <div className={styles.row}>
        <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
        <div className={styles.bubble}>
          <div className={styles.typing}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.typingLabel}>Analizando nomenclatura...</span>
          </div>
        </div>
      </div>
    )
  }

  if (role === 'user') {
    return (
      <div className={`${styles.row} ${styles.rowUser}`}>
        <div className={`${styles.avatar} ${styles.avatarUser}`}>USR</div>
        <div className={`${styles.bubble} ${styles.bubbleUser}`}>{text}</div>
      </div>
    )
  }

  return (
    <div className={styles.row}>
      <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
      {data ? <AiBubble data={data} /> : (
        <div className={styles.bubble}>{text}</div>
      )}
    </div>
  )
}
