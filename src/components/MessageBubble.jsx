import React, { useState } from 'react'
import { fmtCurrency } from '../utils/format.js'
import { generateDiagnosticoPDF } from '../utils/pdfExport.js'
import { exportToExcel } from '../utils/excel.js'
import { COUNTRY_RESTRICTIONS } from '../data/countries.js'
import styles from './MessageBubble.module.css'

function Tag({ children, type }) {
  return <span className={`${styles.tag} ${styles['tag_' + (type||'cyan')]}`}>{children}</span>
}

function RuleBox({ title, children, color }) {
  return <div className={`${styles.ruleBox} ${color === 'cyan' ? styles.ruleBoxCyan : ''}`}><strong>{title}: </strong>{children}</div>
}

function AlertBox({ children, level }) {
  return <div className={`${styles.alertaBox} ${level === 'warning' ? styles.alertWarning : level === 'info' ? styles.alertInfo : ''}`}>{children}</div>
}

function ValTable({ v, adValorem }) {
  const fmt = n => fmtCurrency(n, v.moneda)
  const ti = v.total_importacion || (v.cif + v.total_tributos)
  return (
    <table className={styles.valTable}>
      <tbody>
        <tr><td>Valor FOB</td><td>{fmt(v.fob)}</td></tr>
        <tr><td>Flete</td><td>{fmt(v.flete)}</td></tr>
        <tr><td>Seguro</td><td>{fmt(v.seguro)}</td></tr>
        <tr className={styles.totalRow}><td>BASE IMPONIBLE (CIF)</td><td>{fmt(v.cif)}</td></tr>
        <tr><td>Ad Valorem ({adValorem})</td><td>{fmt(v.ad_valorem_monto)}</td></tr>
        <tr><td>Tasa Aduanera (1% Art. 3 RDLOA)</td><td>{fmt(v.tasa_aduanera_monto)}</td></tr>
        <tr><td>Base Gravada IVA</td><td>{fmt(v.base_iva)}</td></tr>
        <tr><td>IVA (16%)</td><td>{fmt(v.iva_monto)}</td></tr>
        <tr className={styles.totalRow}><td>TOTAL TRIBUTOS</td><td>{fmt(v.total_tributos)}</td></tr>
        <tr className={styles.grandTotal}><td>TOTAL IMPORTACIÓN (CIF + Tributos)</td><td>{fmt(ti)}</td></tr>
      </tbody>
    </table>
  )
}

function DiagnosticoCard({ data, onSendFollowup, isMulti }) {
  const [genPdf, setGenPdf] = useState(false)
  const [genXls, setGenXls] = useState(false)
  const [pdfDone, setPdfDone] = useState(false)

  async function handlePDF() {
    setGenPdf(true)
    try { await generateDiagnosticoPDF(data, data.valoracion); setPdfDone(true) } catch(e) { console.error(e) }
    setGenPdf(false)
  }

  async function handleExcel() {
    setGenXls(true)
    try { await exportToExcel(data, data.valoracion) } catch(e) { console.error(e) }
    setGenXls(false)
  }

  // Check country restrictions from observaciones
  const countryAlerts = Object.entries(COUNTRY_RESTRICTIONS).filter(([country]) =>
    (data.observaciones || []).some(o => o.toLowerCase().includes(country.toLowerCase())) ||
    (data.mercancia || '').toLowerCase().includes(country.toLowerCase())
  )

  return (
    <div className={isMulti ? styles.multiCard : ''}>
      {isMulti && <div className={styles.multiTitle}>{data.mercancia}</div>}
      <div className={styles.sectionTitle}>📄 Diagnóstico Técnico Aduanero</div>
      <div className={styles.mercancia}><span className={styles.label}>Mercancía:</span> <strong>{data.mercancia||'—'}</strong></div>
      <div className={styles.hsCode}>{data.codigo||'—'}</div>
      <div className={styles.hsDesc}>{data.descripcion_codigo||''}</div>
      <div className={styles.tagRow}>
        <Tag type="green">Ad Valorem: {data.ad_valorem||'—'}</Tag>
        <Tag type="gold">T. Aduanera: 1%</Tag>
        <Tag type="cyan">IVA: 16%</Tag>
      </div>
      {data.regimen_legal?.length > 0 && (
        <div className={styles.tagRow}>{data.regimen_legal.map((r,i)=><Tag key={i} type="cyan">{r}</Tag>)}</div>
      )}
      {countryAlerts.length > 0 && countryAlerts.map(([country, info]) => (
        <AlertBox key={country} level={info.level}>🌐 <strong>{country}:</strong> {info.alert}</AlertBox>
      ))}
      <hr className={styles.divider}/>
      <div className={styles.sectionTitle}>🔬 Sustento Legal</div>
      {data.rgi_justificacion && <RuleBox title={data.rgi_regla||'RGI 1'}>{data.rgi_justificacion}</RuleBox>}
      {data.nota_seccion && <RuleBox title="Nota de Sección" color="cyan">{data.nota_seccion}</RuleBox>}
      {data.nota_capitulo && <RuleBox title="Nota de Capítulo" color="cyan">{data.nota_capitulo}</RuleBox>}
      {data.notas_explicativas && <RuleBox title="Notas Explicativas">{data.notas_explicativas}</RuleBox>}
      {data.solicitar_flete_seguro && (
        <>
          <hr className={styles.divider}/>
          <div className={styles.sectionTitle}>💰 Valoración</div>
          <div className={styles.fletePrompt}>
            Tiene el valor FOB. Para calcular la base imponible CIF necesito:
            <div className={styles.fleteHint}>Escriba el <strong>Flete (USD)</strong> y <strong>Seguro (USD)</strong> para continuar con la liquidación</div>
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
          {data.observaciones.map((o,i)=><AlertBox key={i}>{o}</AlertBox>)}
        </>
      )}
      {!isMulti && data.pregunta_final && (
        <>
          <hr className={styles.divider}/>
          <div className={styles.followUp}>
            <div className={styles.followUpText}>{data.pregunta_final}</div>
            <div className={styles.followUpBtns}>
              <button className={styles.fuBtn} onClick={() => onSendFollowup('Sí, necesito clasificar otra mercancía')}>Otra mercancía</button>
              <button className={styles.fuBtn} onClick={() => onSendFollowup('Ajuste los datos de valoración o flete')}>Ajustar datos</button>
              <button className={`${styles.fuBtn} ${styles.fuBtnPdf}`} onClick={handlePDF} disabled={genPdf}>{genPdf ? 'Generando...' : pdfDone ? '✓ PDF generado' : '📄 PDF expediente'}</button>
              <button className={`${styles.fuBtn} ${styles.fuBtnXls}`} onClick={handleExcel} disabled={genXls}>{genXls ? '...' : '📊 Excel'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AiBubble({ data, onSendFollowup }) {
  const [genPdf, setGenPdf] = useState(false)

  if (data.necesita_info && data.preguntas?.length > 0) {
    return (
      <div className={styles.bubble}>
        <div className={styles.sectionTitle}>Información requerida</div>
        <p className={styles.intro}>Para aplicar las Notas Legales del SA necesito precisar sobre <strong>{data.mercancia||'la mercancía'}</strong>:</p>
        <ul className={styles.qList}>{data.preguntas.map((q,i)=><li key={i}>{q}</li>)}</ul>
      </div>
    )
  }

  if (data.items && data.items.length > 0) {
    return (
      <div className={styles.bubble}>
        <div className={styles.sectionTitle}>📋 Clasificación de {data.items.length} Mercancías</div>
        {data.items.map((item, i) => <DiagnosticoCard key={i} data={item} onSendFollowup={onSendFollowup} isMulti={true}/>)}
        {data.pregunta_final && (
          <>
            <hr className={styles.divider}/>
            <div className={styles.followUp}>
              <div className={styles.followUpText}>{data.pregunta_final}</div>
              <div className={styles.followUpBtns}>
                <button className={styles.fuBtn} onClick={() => onSendFollowup('Clasifique otra mercancía')}>Otra mercancía</button>
                <button className={`${styles.fuBtn} ${styles.fuBtnPdf}`} onClick={() => { setGenPdf(true); generateDiagnosticoPDF(data.items[0], null).finally(()=>setGenPdf(false)) }} disabled={genPdf}>
                  {genPdf ? '...' : '📄 PDF expediente'}
                </button>
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
  if (isTyping) return (
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
  if (role === 'user') return (
    <div className={`${styles.row} ${styles.rowUser}`}>
      <div className={`${styles.avatar} ${styles.avatarUser}`}>USR</div>
      <div className={`${styles.bubble} ${styles.bubbleUser}`}>{text}</div>
    </div>
  )
  return (
    <div className={styles.row}>
      <div className={`${styles.avatar} ${styles.avatarAi}`}>AI</div>
      {data ? <AiBubble data={data} onSendFollowup={onSendFollowup}/> : <div className={styles.bubble}>{text}</div>}
    </div>
  )
}
