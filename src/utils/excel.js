// Exportación a Excel usando SheetJS (CDN)
export function exportToExcel(data, valoracion) {
  return new Promise((resolve) => {
    if (window.XLSX) { doExport(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    script.onload = doExport
    document.head.appendChild(script)

    function doExport() {
      const XLSX = window.XLSX
      const wb = XLSX.utils.book_new()

      // Hoja 1: Clasificación
      const wsData = [
        ['DIAGNÓSTICO TÉCNICO ADUANERO', '', '', ''],
        ['Decreto N° 4.944 – Gaceta Oficial N° 6.804 Extraordinario – 24/04/2024'],
        ['Fecha:', new Date().toLocaleDateString('es-VE')],
        [],
        ['DATOS DE LA MERCANCÍA'],
        ['Mercancía:', data.mercancia || '—'],
        ['Posición Arancelaria:', data.codigo || '—'],
        ['Descripción Oficial:', data.descripcion_codigo || '—'],
        ['Ad Valorem:', data.ad_valorem || '—'],
        ['Tasa Aduanera:', '1% (Art. 3 RDLOA)'],
        ['IVA:', '16%'],
        [],
        ['RÉGIMEN LEGAL'],
        ...(data.regimen_legal || []).map((r, i) => [i + 1 + '.', r]),
        [],
        ['SUSTENTO LEGAL'],
        ['RGI Aplicada:', data.rgi_regla || '—'],
        ['Justificación:', data.rgi_justificacion || '—'],
        ['Nota de Sección:', data.nota_seccion || '—'],
        ['Nota de Capítulo:', data.nota_capitulo || '—'],
        ['Notas Explicativas:', data.notas_explicativas || '—'],
        [],
        ['OBSERVACIONES'],
        ...(data.observaciones || []).map((o, i) => [i + 1 + '.', o]),
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(wsData)
      ws1['!cols'] = [{ wch: 28 }, { wch: 70 }]
      XLSX.utils.book_append_sheet(wb, ws1, 'Clasificación')

      // Hoja 2: Valoración
      if (valoracion && valoracion.cif) {
        const v = valoracion
        const fmt = n => parseFloat(n || 0).toFixed(2)
        const wsVal = [
          ['VALORACIÓN Y LIQUIDACIÓN ADUANERA'],
          ['Base legal: Acuerdo de Valoración OMC – Art. 17 LOCA'],
          [],
          ['CONCEPTO', 'USD'],
          ['Valor FOB', fmt(v.fob)],
          ['Flete', fmt(v.flete)],
          ['Seguro', fmt(v.seguro)],
          ['BASE IMPONIBLE (CIF)', fmt(v.cif)],
          [],
          ['Ad Valorem (' + data.ad_valorem + ')', fmt(v.adValoremMonto || v.ad_valorem_monto)],
          ['Tasa Aduanera (1%)', fmt(v.tasaAduanera || v.tasa_aduanera_monto)],
          ['Base Gravada IVA', fmt(v.baseIva || v.base_iva)],
          ['IVA (16%)', fmt(v.ivaMonto || v.iva_monto)],
          [],
          ['TOTAL TRIBUTOS', fmt(v.totalTributos || v.total_tributos)],
          ['TOTAL IMPORTACIÓN (CIF + Tributos)', fmt(v.totalImportacion || v.total_importacion || (v.cif + (v.totalTributos || v.total_tributos)))],
        ]
        const ws2 = XLSX.utils.aoa_to_sheet(wsVal)
        ws2['!cols'] = [{ wch: 36 }, { wch: 18 }]
        XLSX.utils.book_append_sheet(wb, ws2, 'Valoración')
      }

      // Hoja 3: Expediente
      const expData = [
        ['ORDEN DEL EXPEDIENTE DE IMPORTACIÓN'],
        ['Mercancía:', data.mercancia || '—'],
        ['Posición Arancelaria:', data.codigo || '—'],
        [],
        ['N°', 'DOCUMENTO', 'ENTE EMISOR', 'OBSERVACIÓN'],
        ['1', 'RIF del Importador (vigente)', 'SENIAT', 'Obligatorio'],
        ['2', 'Registro de Importador activo', 'SENIAT', 'Obligatorio'],
        ['3', 'Factura Comercial original', 'Proveedor', 'Con descripción detallada'],
        ['4', 'Conocimiento de embarque (B/L / AWB / CRT)', 'Naviera/Aerolínea', 'Según vía de transporte'],
        ['5', 'Póliza de Seguro', 'Aseguradora', 'Cubre valor CIF'],
        ['6', 'Declaración Andina de Valor (DAV)', 'Importador', 'Con soporte de precio'],
        ['7', 'Lista de Empaque (Packing List)', 'Proveedor', 'Si aplica'],
        ['8', 'Certificado de Origen', 'País exportador', 'Si aplica acuerdo preferencial'],
        ...(data.regimen_legal || []).map((r, i) => [String(9 + i), r, 'Ente competente', 'Obligatorio previo al despacho']),
        [String(9 + (data.regimen_legal || []).length), 'Declaración de Aduanas (SIDUNEA)', 'Importador/Despachante', 'Con todos los soportes'],
        [String(10 + (data.regimen_legal || []).length), 'Comprobante de pago de tributos', 'Banco autorizado', 'Previo al levante'],
      ]
      const ws3 = XLSX.utils.aoa_to_sheet(expData)
      ws3['!cols'] = [{ wch: 5 }, { wch: 42 }, { wch: 25 }, { wch: 35 }]
      XLSX.utils.book_append_sheet(wb, ws3, 'Expediente')

      const filename = 'ATC_' + (data.codigo || 'diagnostico').replace(/\./g, '') + '_' + new Date().toISOString().slice(0, 10) + '.xlsx'
      XLSX.writeFile(wb, filename)
      resolve(filename)
    }
  })
}
