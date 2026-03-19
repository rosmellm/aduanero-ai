// Genera PDF del diagnóstico aduanero usando jsPDF (CDN)
export function generateDiagnosticoPDF(data, valoracion) {
  return new Promise((resolve) => {
    // Load jsPDF from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210
      const margin = 18
      const maxW = W - margin * 2
      let y = 20

      function addLine(h = 6) { y += h }
      function checkPage(needed = 20) {
        if (y + needed > 270) { doc.addPage(); y = 20 }
      }

      // ── Header ──
      doc.setFillColor(29, 78, 216)
      doc.rect(0, 0, W, 28, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('DIAGNÓSTICO TÉCNICO ADUANERO', margin, 12)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Decreto N° 4.944 · Gaceta Oficial N° 6.804 Extraordinario · 24/04/2024', margin, 19)
      doc.text('NANDINA · Sistema Armonizado · República Bolivariana de Venezuela', margin, 24)
      doc.text(new Date().toLocaleDateString('es-VE', { year:'numeric', month:'long', day:'numeric' }), W - margin, 19, { align: 'right' })

      y = 36
      doc.setTextColor(15, 23, 42)

      // ── Sección 1: Identificación ──
      function sectionTitle(title) {
        checkPage(14)
        doc.setFillColor(239, 246, 255)
        doc.rect(margin, y - 4, maxW, 9, 'F')
        doc.setDrawColor(29, 78, 216)
        doc.rect(margin, y - 4, 3, 9, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(29, 78, 216)
        doc.text(title.toUpperCase(), margin + 6, y + 1)
        doc.setTextColor(15, 23, 42)
        y += 10
      }

      function row(label, value, bold = false) {
        checkPage(10)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text(label + ':', margin, y)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(15, 23, 42)
        const lines = doc.splitTextToSize(String(value || '—'), maxW - 42)
        doc.text(lines, margin + 42, y)
        y += lines.length * 5 + 2
      }

      function textBlock(title, content, color = [29,78,216]) {
        checkPage(20)
        doc.setFillColor(240, 244, 255)
        doc.setDrawColor(...color)
        doc.setLineWidth(0.8)
        const lines = doc.splitTextToSize(String(content || '—'), maxW - 8)
        const h = lines.length * 5 + 10
        doc.rect(margin, y, maxW, h, 'FD')
        doc.line(margin, y, margin, y + h)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...color)
        doc.text(title, margin + 4, y + 5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        doc.text(lines, margin + 4, y + 10)
        y += h + 4
      }

      sectionTitle('1. Identificación de la Mercancía')
      row('Mercancía declarada', data.mercancia, true)
      row('Posición Arancelaria', data.codigo, true)
      row('Descripción oficial', data.descripcion_codigo)
      addLine(2)

      // Tariff badges as table
      doc.setFillColor(29, 78, 216)
      doc.roundedRect(margin, y, 42, 9, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('Ad Valorem: ' + (data.ad_valorem || '—'), margin + 4, y + 5.5)

      doc.setFillColor(59, 130, 246)
      doc.roundedRect(margin + 46, y, 36, 9, 2, 2, 'F')
      doc.text('T. Aduanera: 1%', margin + 50, y + 5.5)

      doc.setFillColor(96, 165, 250)
      doc.roundedRect(margin + 86, y, 24, 9, 2, 2, 'F')
      doc.text('IVA: 16%', margin + 90, y + 5.5)
      doc.setTextColor(15, 23, 42)
      y += 14

      // Régimen Legal
      if (data.regimen_legal && data.regimen_legal.length > 0) {
        checkPage(16)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text('RÉGIMEN LEGAL:', margin, y)
        y += 5
        data.regimen_legal.forEach(r => {
          doc.setFillColor(239, 246, 255)
          doc.roundedRect(margin, y - 3, maxW, 7, 1.5, 1.5, 'F')
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(29, 78, 216)
          doc.setFontSize(7.5)
          const rLines = doc.splitTextToSize('• ' + r, maxW - 4)
          doc.text(rLines, margin + 3, y + 1)
          y += rLines.length * 4.5 + 2
        })
        addLine(2)
      }

      // ── Sección 2: Sustento Legal ──
      sectionTitle('2. Sustento Legal — Análisis Técnico')
      if (data.rgi_justificacion) textBlock(data.rgi_regla || 'RGI Aplicada', data.rgi_justificacion)
      if (data.nota_seccion) textBlock('Nota de Sección', data.nota_seccion, [8, 145, 178])
      if (data.nota_capitulo) textBlock('Nota de Capítulo', data.nota_capitulo, [8, 145, 178])
      if (data.notas_explicativas) textBlock('Notas Explicativas SA', data.notas_explicativas)

      // ── Sección 3: Valoración ──
      if (valoracion && valoracion.cif) {
        sectionTitle('3. Valoración y Liquidación Tributaria Proyectada')

        const rows = [
          ['Valor FOB', 'USD ' + Number(valoracion.fob).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['Flete', 'USD ' + Number(valoracion.flete).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['Seguro', 'USD ' + Number(valoracion.seguro).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['BASE IMPONIBLE (CIF)', 'USD ' + Number(valoracion.cif).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['Ad Valorem (' + (data.ad_valorem||'') + ')', 'USD ' + Number(valoracion.ad_valorem_monto).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['Tasa Aduanera (1% Art. 3 RDLOA)', 'USD ' + Number(valoracion.tasa_aduanera_monto).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['Base Gravada IVA', 'USD ' + Number(valoracion.base_iva).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['IVA (16%)', 'USD ' + Number(valoracion.iva_monto).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['TOTAL TRIBUTOS', 'USD ' + Number(valoracion.total_tributos).toLocaleString('es-VE', {minimumFractionDigits:2})],
          ['TOTAL IMPORTACIÓN (CIF + Tributos)', 'USD ' + Number(valoracion.total_importacion || (valoracion.cif + valoracion.total_tributos)).toLocaleString('es-VE', {minimumFractionDigits:2})],
        ]

        checkPage(rows.length * 8 + 10)
        rows.forEach((r, i) => {
          const isTotal = r[0].startsWith('TOTAL')
          const isCIF = r[0].startsWith('BASE')
          doc.setFillColor(isTotal ? 29 : isCIF ? 239 : i % 2 === 0 ? 248 : 255, isTotal ? 78 : isCIF ? 246 : 250, isTotal ? 216 : isCIF ? 255 : 255)
          doc.rect(margin, y, maxW, 7, 'F')
          doc.setFontSize(8)
          doc.setFont('helvetica', isTotal || isCIF ? 'bold' : 'normal')
          doc.setTextColor(isTotal ? 255 : 15, isTotal ? 255 : 23, isTotal ? 255 : 42)
          doc.text(r[0], margin + 3, y + 4.5)
          doc.text(r[1], W - margin - 3, y + 4.5, { align: 'right' })
          y += 7
        })
        addLine(4)
      }

      // ── Sección 4: Trámites y Expediente ──
      sectionTitle('4. Trámites Requeridos y Orden del Expediente')

      const tramites = [
        'RIF del importador vigente (SENIAT)',
        'Registro de Importador activo (SENIAT)',
        'Declaración Andina de Valor (DAV) con soporte de precio',
        'Factura comercial original con descripción detallada',
        'Conocimiento de embarque (B/L, AWB o CRT según vía)',
        'Póliza de seguro de la mercancía',
        'Certificado de Origen (si aplica tratado preferencial)',
        ...(data.regimen_legal || []).map(r => r),
        'Declaración de Aduanas (SIDUNEA)',
        'Comprobante de pago de tributos aduaneros',
      ]

      tramites.forEach((t, i) => {
        checkPage(8)
        doc.setFillColor(i % 2 === 0 ? 248 : 255, 250, 255)
        doc.rect(margin, y, maxW, 6.5, 'F')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(29, 78, 216)
        doc.text(String(i + 1) + '.', margin + 2, y + 4)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(15, 23, 42)
        const tLines = doc.splitTextToSize(t, maxW - 14)
        doc.text(tLines, margin + 10, y + 4)
        y += tLines.length * 6 + 0.5
      })

      addLine(4)

      // ── Sección 5: Observaciones ──
      if (data.observaciones && data.observaciones.length > 0) {
        sectionTitle('5. Observaciones y Alertas')
        data.observaciones.forEach(o => {
          checkPage(12)
          doc.setFillColor(254, 242, 242)
          doc.setDrawColor(220, 38, 38)
          doc.setLineWidth(0.6)
          const oLines = doc.splitTextToSize('⚠ ' + o, maxW - 8)
          const h = oLines.length * 5 + 8
          doc.rect(margin, y, maxW, h, 'FD')
          doc.line(margin, y, margin, y + h)
          doc.setFontSize(7.5)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(153, 27, 27)
          doc.text(oLines, margin + 5, y + 5)
          y += h + 3
        })
      }

      // ── Footer ──
      const pageCount = doc.internal.getNumberOfPages()
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p)
        doc.setFillColor(29, 78, 216)
        doc.rect(0, 285, W, 12, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text('ADUANERO.AI · Venezuela · Decreto N° 4.944 · Gaceta Oficial N° 6.804 Extraordinario', margin, 291)
        doc.text('Pág. ' + p + ' / ' + pageCount, W - margin, 291, { align: 'right' })
      }

      const filename = 'ATC_' + (data.codigo || 'diagnostico').replace(/\./g, '') + '_' + new Date().toISOString().slice(0,10) + '.pdf'
      doc.save(filename)
      resolve(filename)
    }
    document.head.appendChild(script)
  })
}
