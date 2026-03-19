import { SYSTEM_PROMPT } from '../constants.js'

let arancelData = null

export async function loadArancelData() {
  if (arancelData) return arancelData
  try {
    const res = await fetch('/arancel.json')
    arancelData = await res.json()
    return arancelData
  } catch (e) {
    console.warn('No se pudo cargar arancel.json:', e)
    return null
  }
}

function getRelevantEntries(query, data, maxEntries = 20) {
  if (!data) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const words = q.split(/\s+/).filter(w => w.length > 3)
  const scored = data.entries.map(e => {
    const desc = (e.d || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let score = 0
    for (const w of words) {
      if (desc.includes(w)) score += 2
      if ((e.c || '').includes(w)) score += 3
    }
    const code = e.c || ''
    if ((q.includes('computador') || q.includes('laptop') || q.includes('portatil')) && (code.startsWith('84') || code.startsWith('85'))) score += 2
    if ((q.includes('medicament') || q.includes('farmac')) && code.startsWith('30')) score += 2
    if ((q.includes('aceite') || q.includes('aliment')) && (code.startsWith('0') || code.startsWith('1') || code.startsWith('2'))) score += 2
    if ((q.includes('vehiculo') || q.includes('camion') || q.includes('auto')) && (code.startsWith('87') || code.startsWith('84'))) score += 2
    if ((q.includes('calzado') || q.includes('ropa') || q.includes('textil')) && (code.startsWith('61') || code.startsWith('62') || code.startsWith('64'))) score += 2
    if ((q.includes('valvula') || q.includes('motor') || q.includes('bomba')) && code.startsWith('84')) score += 2
    if ((q.includes('quimico') || q.includes('quimica') || q.includes('reactivo')) && (code.startsWith('28') || code.startsWith('29') || code.startsWith('38'))) score += 2
    return { ...e, score }
  })
  return scored.filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, maxEntries)
}

function buildContextBlock(query, data) {
  const relevant = getRelevantEntries(query, data)
  if (relevant.length === 0) return ''
  const regimeMap = data.regime_map || {}
  const chapters = [...new Set(relevant.map(e => (e.c || '').slice(0, 2)))]
  const chapterNotesText = chapters.map(cap => {
    const note = data.chapter_notes && data.chapter_notes[cap]
    return note ? 'CAP ' + cap + ': ' + note.slice(0, 500) : ''
  }).filter(Boolean).join('\n\n')
  const entriesText = relevant.map(e => {
    const regs = (e.r || []).map(r => regimeMap[r] ? r + '=' + regimeMap[r] : r).join(', ')
    return e.c + ' | "' + e.d + '" | AdVal:' + e.av + '% | Reg:[' + regs + ']' + (e.bit ? ' [BIT]' : '') + ' | ' + e.u
  }).join('\n')
  return '\n\n=== DATOS REALES - DECRETO N° 4.944 (GACETA 6.804 EXTRAORDINARIO - 24/04/2024) ===\n\nSUBPARTIDAS NANDINA ENCONTRADAS:\n' + entriesText + '\n\nNOTAS DE CAPÍTULO:\n' + chapterNotesText + '\n\nREGÍMENES LEGALES ART. 21:\n' + Object.entries(regimeMap).map(([k, v]) => k + '. ' + v).join('\n') + '\n\nINSTRUCCIÓN: Usa estos datos reales. Cita el código exacto. Tasa Aduanera 1% (Art. 3 RDLOA). IVA 16%.\n=== FIN DATOS OFICIALES ==='
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getMediaType(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.gif')) return 'image/gif'
  if (name.endsWith('.webp')) return 'image/webp'
  return file.type || 'application/octet-stream'
}

export async function callAduaneroAI(messages, attachedFiles = []) {
  const data = await loadArancelData()
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const contextBlock = lastUser ? buildContextBlock(typeof lastUser.content === 'string' ? lastUser.content : lastUser.content?.[0]?.text || '', data) : ''
  const enrichedSystem = SYSTEM_PROMPT + contextBlock

  // Build messages with file attachments
  const apiMessages = []
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role === 'user' && i === messages.length - 1 && attachedFiles.length > 0) {
      // Last user message — attach files
      const contentParts = []
      for (const file of attachedFiles) {
        const b64 = await fileToBase64(file)
        const mediaType = getMediaType(file)
        if (mediaType === 'application/pdf') {
          contentParts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } })
        } else if (mediaType.startsWith('image/')) {
          contentParts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } })
        }
      }
      contentParts.push({ type: 'text', text: typeof msg.content === 'string' ? msg.content : msg.content?.[0]?.text || '' })
      apiMessages.push({ role: 'user', content: contentParts })
    } else {
      apiMessages.push(msg)
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: enrichedSystem,
      messages: apiMessages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err && err.error && err.error.message) || 'Error HTTP ' + response.status)
  }

  const apiData = await response.json()
  const raw = (apiData && apiData.content && apiData.content[0] && apiData.content[0].text) || ''

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return { parsed: JSON.parse(clean), raw }
  } catch {
    throw new Error('El motor no pudo estructurar la respuesta. Intente reformular la consulta.')
  }
}
