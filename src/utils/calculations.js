// Módulo de cálculos aduaneros

export function calcLiquidacion(fob, flete, seguro, adValoremPct) {
  const cif = parseFloat(fob) + parseFloat(flete) + parseFloat(seguro)
  const av = parseFloat(adValoremPct) / 100
  const adValoremMonto = cif * av
  const tasaAduanera = cif * 0.01
  const baseIva = cif + adValoremMonto + tasaAduanera
  const ivaMonto = baseIva * 0.16
  const totalTributos = adValoremMonto + tasaAduanera + ivaMonto
  const totalImportacion = cif + totalTributos
  return {
    fob: parseFloat(fob), flete: parseFloat(flete), seguro: parseFloat(seguro),
    cif, adValoremMonto, tasaAduanera, baseIva, ivaMonto,
    totalTributos, totalImportacion, moneda: 'USD'
  }
}

// Inversa: dado el total de tributos deseado, ¿cuál es el FOB máximo?
export function calcFobMaximo(totalTributosDeseado, adValoremPct, fleteRatio = 0.04, seguroRatio = 0.008) {
  const av = parseFloat(adValoremPct) / 100
  // CIF = FOB * (1 + fleteRatio + seguroRatio)
  // tributos = CIF*(av + 0.01) + (CIF*(av+0.01+1))*0.16
  // Resolvemos para CIF
  const k = 1 + fleteRatio + seguroRatio
  // totalTributos = CIF*av + CIF*0.01 + (CIF + CIF*av + CIF*0.01)*0.16
  // = CIF*(av + 0.01) + CIF*(1 + av + 0.01)*0.16
  const factor = (av + 0.01) + (1 + av + 0.01) * 0.16
  const cif = totalTributosDeseado / factor
  const fob = cif / k
  const flete = fob * fleteRatio
  const seguro = fob * seguroRatio
  return { fob, flete, seguro, cif, totalTributos: totalTributosDeseado }
}

// Simulador de escenarios por vía
export function simularEscenarios(fob, adValoremPct) {
  const vias = {
    maritimo: { fleteRatio: 0.04, seguroRatio: 0.008 },
    aereo: { fleteRatio: 0.22, seguroRatio: 0.015 },
    terrestre: { fleteRatio: 0.08, seguroRatio: 0.008 },
  }
  return Object.entries(vias).reduce((acc, [via, r]) => {
    const flete = fob * r.fleteRatio
    const seguro = fob * r.seguroRatio
    acc[via] = calcLiquidacion(fob, flete, seguro, adValoremPct)
    acc[via].via = via
    return acc
  }, {})
}

export function formatUSD(n) {
  return 'USD ' + parseFloat(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatBs(n, tasa) {
  if (!tasa) return '—'
  const bs = parseFloat(n || 0) * parseFloat(tasa)
  return 'Bs. ' + bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
