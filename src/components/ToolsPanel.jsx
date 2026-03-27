import React, { useState } from 'react'
import { calcLiquidacion, calcFobMaximo, simularEscenarios, formatUSD } from '../utils/calculations.js'
import { exportToExcel } from '../utils/excel.js'
import { getBCVRate, saveBCVRate } from '../utils/storage.js'
import styles from './ToolsPanel.module.css'

function Tab({ id, active, onClick, children }) {
  return <button className={`${styles.tab} ${active === id ? styles.tabActive : ''}`} onClick={() => onClick(id)}>{children}</button>
}

// ── Calculadora Inversa ──
function CalcInversa() {
  const [tributos, setTributos] = useState('')
  const [av, setAv] = useState('10')
  const [via, setVia] = useState('maritimo')
  const [result, setResult] = useState(null)

  const viaRatios = {
    maritimo: { flete: 0.04, seguro: 0.008 },
    aereo: { flete: 0.22, seguro: 0.015 },
    terrestre: { flete: 0.08, seguro: 0.008 },
  }

  function calcular() {
    if (!tributos || !av) return
    const r = viaRatios[via]
    const res = calcFobMaximo(parseFloat(tributos), parseFloat(av), r.flete, r.seguro)
    setResult(res)
  }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolTitle}>Calculadora Inversa — FOB Máximo</div>
      <p className={styles.toolDesc}>Ingrese el total de tributos que desea pagar y obtenga el FOB máximo permitido.</p>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Total tributos deseados (USD)</label>
          <input type="number" value={tributos} onChange={e => setTributos(e.target.value)} placeholder="Ej: 5000" className={styles.inp} />
        </div>
        <div className={styles.formGroup}>
          <label>Ad Valorem (%)</label>
          <input type="number" value={av} onChange={e => setAv(e.target.value)} placeholder="Ej: 10" className={styles.inp} />
        </div>
        <div className={styles.formGroup}>
          <label>Vía de transporte</label>
          <select value={via} onChange={e => setVia(e.target.value)} className={styles.inp}>
            <option value="maritimo">Marítima</option>
            <option value="aereo">Aérea</option>
            <option value="terrestre">Terrestre</option>
          </select>
        </div>
      </div>
      <button className={styles.calcBtn} onClick={calcular}>Calcular FOB Máximo</button>
      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultRow}><span>FOB Máximo</span><strong>{formatUSD(result.fob)}</strong></div>
          <div className={styles.resultRow}><span>Flete estimado</span><span>{formatUSD(result.flete)}</span></div>
          <div className={styles.resultRow}><span>Seguro estimado</span><span>{formatUSD(result.seguro)}</span></div>
          <div className={styles.resultRow}><span>CIF resultante</span><span>{formatUSD(result.cif)}</span></div>
          <div className={`${styles.resultRow} ${styles.resultTotal}`}><span>Tributos totales</span><strong>{formatUSD(result.totalTributos)}</strong></div>
        </div>
      )}
    </div>
  )
}

// ── Simulador de Escenarios ──
function Simulador() {
  const [fob, setFob] = useState('')
  const [av, setAv] = useState('10')
  const [results, setResults] = useState(null)

  function simular() {
    if (!fob || !av) return
    setResults(simularEscenarios(parseFloat(fob), parseFloat(av)))
  }

  const viaLabels = { maritimo: 'Marítima', aereo: 'Aérea', terrestre: 'Terrestre' }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolTitle}>Simulador de Escenarios por Vía</div>
      <p className={styles.toolDesc}>Compare el impacto tributario según la vía de transporte.</p>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Valor FOB (USD)</label>
          <input type="number" value={fob} onChange={e => setFob(e.target.value)} placeholder="Ej: 10000" className={styles.inp} />
        </div>
        <div className={styles.formGroup}>
          <label>Ad Valorem (%)</label>
          <input type="number" value={av} onChange={e => setAv(e.target.value)} placeholder="Ej: 10" className={styles.inp} />
        </div>
      </div>
      <button className={styles.calcBtn} onClick={simular}>Simular</button>
      {results && (
        <div className={styles.scenarioGrid}>
          {Object.entries(results).map(([via, r]) => (
            <div key={via} className={styles.scenarioCard}>
              <div className={styles.scenarioTitle}>{viaLabels[via]}</div>
              <div className={styles.scenarioRow}><span>CIF</span><span>{formatUSD(r.cif)}</span></div>
              <div className={styles.scenarioRow}><span>Tributos</span><span>{formatUSD(r.totalTributos)}</span></div>
              <div className={`${styles.scenarioRow} ${styles.scenarioTotal}`}><span>Total</span><strong>{formatUSD(r.totalImportacion)}</strong></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Validador de Código ──
function ValidadorCodigo({ arancelData }) {
  const [codigo, setCodigo] = useState('')
  const [result, setResult] = useState(null)
  const REGIME_MAP = arancelData?.regime_map || {}

  function validar() {
    if (!arancelData || !codigo.trim()) return
    const clean = codigo.replace(/\./g, '').replace(/\s/g, '')
    const found = arancelData.entries.find(e => e.c.replace(/\./g, '') === clean || e.c.replace(/\./g, '').startsWith(clean))
    if (found) {
      const regs = (found.r || []).map(r => REGIME_MAP[r] || 'Régimen ' + r)
      setResult({ found: true, entry: found, regimes: regs })
    } else {
      setResult({ found: false })
    }
  }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolTitle}>Validador de Código Arancelario</div>
      <p className={styles.toolDesc}>Verifique si un código NANDINA existe en el Decreto N° 4.944.</p>
      <div className={styles.formGrid}>
        <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
          <label>Código arancelario (4, 6, 8 o 10 dígitos)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ej: 8471.30.00.00" className={styles.inp} onKeyDown={e => e.key === 'Enter' && validar()} />
            <button className={styles.calcBtn} style={{ whiteSpace: 'nowrap' }} onClick={validar}>Validar</button>
          </div>
        </div>
      </div>
      {result && (
        result.found ? (
          <div className={`${styles.resultBox} ${styles.resultOk}`}>
            <div className={styles.validBadge}>✓ Código válido en Decreto N° 4.944</div>
            <div className={styles.resultRow}><span>Código</span><strong style={{ fontFamily: 'var(--mono)' }}>{result.entry.c}</strong></div>
            <div className={styles.resultRow}><span>Descripción</span><span>{result.entry.d}</span></div>
            <div className={styles.resultRow}><span>Ad Valorem</span><strong>{result.entry.av}%</strong></div>
            {result.entry.bit && <div className={styles.resultRow}><span>Categoría</span><span style={{ color: 'var(--cyan2)' }}>BIT — Bienes de Informática y Telecomunicaciones</span></div>}
            {result.regimes.length > 0 && <div className={styles.resultRow}><span>Régimen Legal</span><div>{result.regimes.map((r, i) => <div key={i} style={{ color: 'var(--text2)', fontSize: '11px' }}>{r}</div>)}</div></div>}
          </div>
        ) : (
          <div className={`${styles.resultBox} ${styles.resultError}`}>
            <div className={styles.validBadge} style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)' }}>✗ Código no encontrado en el Decreto N° 4.944</div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px' }}>Verifique la digitación o consulte el texto oficial de la Gaceta.</p>
          </div>
        )
      )}
    </div>
  )
}

// ── Tipo de Cambio BCV ──
function TipoCambio() {
  const [tasa, setTasa] = useState(() => getBCVRate()?.rate || '')
  const [saved, setSaved] = useState(false)
  const stored = getBCVRate()

  function guardar() {
    if (!tasa) return
    saveBCVRate(parseFloat(tasa))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolTitle}>Tasa de Cambio BCV</div>
      <p className={styles.toolDesc}>Ingrese la tasa oficial BCV del día para convertir montos a bolívares en la liquidación.</p>
      {stored && <div className={styles.storedRate}>Tasa guardada: <strong>Bs. {stored.rate}/USD</strong> — {new Date(stored.date).toLocaleDateString('es-VE')}</div>}
      <div className={styles.formGrid}>
        <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
          <label>Tasa BCV (Bs. por USD)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" value={tasa} onChange={e => setTasa(e.target.value)} placeholder="Ej: 40.50" className={styles.inp} />
            <button className={styles.calcBtn} style={{ whiteSpace: 'nowrap' }} onClick={guardar}>{saved ? '✓ Guardada' : 'Guardar'}</button>
          </div>
        </div>
      </div>
      <p className={styles.toolDesc} style={{ marginTop: '8px' }}>Consulte la tasa oficial en: <strong>bcv.org.ve</strong></p>
    </div>
  )
}

// ── Plantilla de Factura ──
function PlantillaFactura({ onSendFactura }) {
  const [items, setItems] = useState([{ desc: '', fob: '', qty: 1, origin: '' }])

  function addItem() { setItems(prev => [...prev, { desc: '', fob: '', qty: 1, origin: '' }]) }
  function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
  function updateItem(i, field, val) { setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item)) }

  function enviarClasificacion() {
    const text = 'Clasifica las siguientes mercancías de mi factura:\n\n' + items.map((it, i) =>
      `${i + 1}. ${it.desc} — Cantidad: ${it.qty} — FOB unitario: USD ${it.fob}${it.origin ? ' — Origen: ' + it.origin : ''}`
    ).join('\n')
    onSendFactura(text)
  }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolTitle}>Plantilla de Factura</div>
      <p className={styles.toolDesc}>Ingrese los ítems de su factura para clasificación simultánea sin necesidad de subir PDF.</p>
      {items.map((item, i) => (
        <div key={i} className={styles.facturaItem}>
          <div className={styles.facturaItemHeader}>
            <span className={styles.facturaItemNum}>Ítem {i + 1}</span>
            {items.length > 1 && <button className={styles.removeItemBtn} onClick={() => removeItem(i)}>×</button>}
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}>
              <label>Descripción de la mercancía</label>
              <input value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder="Ej: Laptop Dell Core i7 16GB RAM" className={styles.inp} />
            </div>
            <div className={styles.formGroup}>
              <label>FOB unitario (USD)</label>
              <input type="number" value={item.fob} onChange={e => updateItem(i, 'fob', e.target.value)} placeholder="0.00" className={styles.inp} />
            </div>
            <div className={styles.formGroup}>
              <label>Cantidad</label>
              <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="1" className={styles.inp} />
            </div>
            <div className={styles.formGroup}>
              <label>País de origen</label>
              <input value={item.origin} onChange={e => updateItem(i, 'origin', e.target.value)} placeholder="Ej: China" className={styles.inp} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className={styles.addItemBtn} onClick={addItem}>+ Agregar ítem</button>
        <button className={styles.calcBtn} onClick={enviarClasificacion}>Clasificar todos →</button>
      </div>
    </div>
  )
}

export default function ToolsPanel({ visible, onClose, arancelData, onSendMessage }) {
  const [activeTab, setActiveTab] = useState('validador')
  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>HERRAMIENTAS</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.tabs}>
          <Tab id="validador" active={activeTab} onClick={setActiveTab}>Validar código</Tab>
          <Tab id="inversa" active={activeTab} onClick={setActiveTab}>Calc. inversa</Tab>
          <Tab id="escenarios" active={activeTab} onClick={setActiveTab}>Escenarios</Tab>
          <Tab id="factura" active={activeTab} onClick={setActiveTab}>Factura</Tab>
          <Tab id="bcv" active={activeTab} onClick={setActiveTab}>Tasa BCV</Tab>
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'validador' && <ValidadorCodigo arancelData={arancelData} />}
          {activeTab === 'inversa' && <CalcInversa />}
          {activeTab === 'escenarios' && <Simulador />}
          {activeTab === 'factura' && <PlantillaFactura onSendFactura={txt => { onSendMessage(txt); onClose() }} />}
          {activeTab === 'bcv' && <TipoCambio />}
        </div>
      </div>
    </div>
  )
}
