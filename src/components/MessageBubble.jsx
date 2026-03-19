import React, { useState } from 'react'
import { fmtCurrency } from '../utils/format.js'
import { generateDiagnosticoPDF } from '../utils/pdfExport.js'
import styles from './MessageBubble.module.css'

function Tag({ children, type }) {
  return <span className={`${styles.tag} ${styles['tag_' + (type||'cyan')]}`}>{children}</span>
}

function RuleBox({ title, children, color }) {
  return (
    <div className={`${styles.ruleBox} ${color === 'cyan' ? styles.ruleBoxCyan : ''}`}>
      {title && <strong>{title}: </strong>}{children}
    </div>
  )
}

function AlertBox({ children }) {
  return <div className={styles.alertaBox}>{children}</div>
}

function ValTable({ v, adValorem }) {
  const fmt = n => fmtCurrency(n, v.moneda)
  return (
    <table className={styles.valTable}>
      <tbody>
        <tr><td>Valor FOB</td><td>{fmt(v.fob)}</td></tr>
        <tr><td>Flete</td><td>{fmt(v.flete)}</td></tr>
        <tr><td>Seguro</td><td>{fmt(v.seguro)}</td></tr>
        <tr className={styles.totalRow}><td>Base Imponible (CIF)</td><td>{fmt(v.cif)}</td></tr>
        <tr><td>Ad Valorem ({adValorem})</td><td>{fmt(v.ad_valorem_monto)}</td></tr>
        <tr><td>Tasa Aduanera (1% Art.3 RDLOA)</td><td>{fmt(v.tasa_aduanera_monto)}</td></tr>
        <tr><td>Base Gravada IVA</td><td>{fmt(v.base_iva)}</td></tr>
        <tr><td>IVA (16%)</td><td>{fmt(v.iva_monto)}</td></tr>
        <tr className={styles.totalRow}><td>TOTAL TRIBUTOS</td><td>{fmt(v.total_tributos)}</td></tr>
        <tr className={styles.grandTotal}><td>TOTAL IMPORTACIÓN (CIF + Tributos)</td><td>{fmt(v.total_importacion || (v.cif + v.total_tributos))}</td></tr>
      </tbody>
    </table>
  )
}

function DiagnosticoCard({ data, onSendFollowup, isMulti }) {
  const [genPdf, setGenPdf] = useState(false)
  const [pdfDone, setPdfDone] = useState(false)
  const [pdfName, setPdfName] = useState('')

  async function handlePDF() {
    setGenPdf(true)
    try {
      const name = await generateDiagnosticoPDF(data, data.valoracion)
      setPdfName(name)
      setPdfDone(true)
    } catch(e) { console.error(e) }
    setGenPdf(false)
  }

  return (
    <div className={isMulti ? styles.multiCard : ''}>
      {isMulti && <div className={styles.multiTitle}>{data.mercancia}</div>}

      <div className={styles.sectionTitle}>📄 Diagnóstico Técnico Aduanero</div>
      <div className={styles.mercancia}><span className={styles.label}>Mercancía:</span> <strong>{data.mercancia || '—'}</strong></div>
      <div className={styles.hsCode}>{data.codigo || '—'}</div>
      <div className={styles.hsDesc}>{data.descripcion_codigo || ''}</div>

      <div className={styles.tagRow}>
        <Tag type="green">Ad Valorem: {data.ad_valorem || '—'}</Tag>
        <Tag type="gold">T. Aduanera: {data.tasa_aduanera || '1%'}</Tag>
        <Tag type="cyan">IVA: {data.iva || '16%'}</Tag>
      </div>

      {data.regimen_legal?.length > 0 && (
        <div className={styles.tagRow}>
          {data.regimen_legal.map((r,i) => <Tag key={i} type="cyan">{r}</Tag>)}
        </div>
      )}

      <hr className={styles.divider}/>
      <div className={styles.sectionTitle}>🔬 Sustento Legal</div>
      {data.rgi_justificacion && <RuleBox title={data.rgi_regla||'RGI 1'}>{data.rgi_justificacion}</RuleBox>}
      {data.nota_seccion && <RuleBox title="Nota de Sección" color="cyan">{data.nota_seccion}</RuleBox>}
      {data.nota_capitulo && <RuleBox title="Nota de Capítulo" color="cyan">{data.nota_capitulo}</RuleBox>}
      {data.notas_explicativas && <RuleBox title="Notas Explicativas SA">{data.notas_explicativas}</RuleBox>}

      {data.solicitar_flete_seguro && (
        <>
          <hr className={styles.divider}/>
          <div className={styles.sectionTitle}>💰 Valoración</div>
          <div className={styles.fletePrompt}>
            Tiene el valor FOB. Para calcular la base imponible CIF necesito:
            <div className={styles.fleteHint}>Flete (USD) y Seguro (USD) — escríbalos en el chat para continuar</div>
          </div>
        </>
      )}

      {data.tiene_valoracion && data.valoracion && (
        <>
          <hr className={styles.divider}/>
          <div className={styles.sectionTitle}>💰 Valoración y Liquidación</div>
          <ValTable v={data.valoracion} adValorem={data.ad_valorem}/>
          {data.valoracion.alerta_valoracion && <AlertBox><strong>Duda Razonable:</strong> {data.valoracion.alerta_valoracion}</AlertBox>}
        </>
      )}

      {data.observaciones?.length > 0 && (
        <>
          <hr className={styles.divider}/>
          <div className={styles.sectionTitle}>⚠️ Observaciones</div>
          {data.observaciones.map((o,i) => <AlertBox key={i}>{o}</AlertBox>)}
        </>
      )}

      {!isMulti && data.pregunta_final && (
        <>
          <hr className={styles.divider}/>
          <div className={styles.followUp}>
            <div className={styles.followUpText}>{data.pregunta_final}</div>
            <div className={styles.followUpBtns}>
              <button className={styles.fuBtn} onClick={() => onSendFollowup('Sí, clasifique otra mercancía')}>Otra mercancía</button>
              <button className={styles.fuBtn} onClick={() => onSendFollowup('Ajuste los datos de valoración')}>Ajustar datos</button>
              <button className={`${styles.fuBtn} ${styles.fuBtnPdf}`} onClick={handlePDF} disabled={genPdf}>
                {genPdf ? 'Generando...' : pdfDone ? '✓ ' + pdfName : '📄 Generar PDF'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AiBubble({ data, onSendFollowup }) {
  if (data.necesita_info && data.preguntas?.length > 0) {
    return (
      <div className={styles.bubble}>
        <div className={styles.sectionTitle}>Información requerida</div>
        <p className={styles.intro}>Para aplicar las Notas Legales del SA necesito precisar sobre <strong>{data.mercancia||'la mercancía'}</strong>:</p>
        <ul className={styles.qList}>{data.preguntas.map((q,i) => <li key={i}>{q}</li>)}</ul>
      </div>
    )
  }

  // Multiple items (factura)
  if (data.items && data.items.length > 0) {
    return (
      <div className={styles.bubble}>
        <div className={styles.sectionTitle}>📋 Clasificación de {data.items.length} Mercancías</div>
        {data.items.map((item, i) => (
          <DiagnosticoCard key={i} data={item} onSendFollowup={onSendFollowup} isMulti={true}/>
        ))}
        {data.pregunta_final && (
          <>
            <hr className={styles.divider}/>
            <div className={styles.followUp}>
              <div className={styles.followUpText}>{data.pregunta_final}</div>
              <div className={styles.followUpBtns}>
                <button className={styles.fuBtn} onClick={() => onSendFollowup('Sí, clasifique otra mercancía')}>Otra mercancía</button>
                <button className={`${styles.fuBtn} ${styles.fuBtnPdf}`} onClick={() => generateDiagnosticoPDF(data.items[0], data.items[0]?.valoracion)}>📄 PDF del expediente</button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.bubble}>
      <DiagnosticoCard data={data} onSendFollowup={onSendFollowup} isMulti={false}/>
    </div>
  )
}

export default function MessageBubble({ role, text, data, isTyping, onSendFollowup }) {
  if (isTyping) {
    return (
      <div className={styles.row}>
        <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
        <div className={styles.bubble}>
          <div className={styles.typing}>
            <span className={styles.dot}/><span className={styles.dot}/><span className={styles.dot}/>
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
      {data ? <AiBubble data={data} onSendFollowup={onSendFollowup}/> : <div className={styles.bubble}>{text}</div>}
    </div>
  )
}
