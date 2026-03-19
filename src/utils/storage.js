// Historial persistente usando localStorage
const HISTORY_KEY = 'aduanero_ai_history'
const MAX_HISTORY = 50

export function saveToHistory(entry) {
  try {
    const history = getHistory()
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      query: entry.query,
      mercancia: entry.mercancia,
      codigo: entry.codigo,
      ad_valorem: entry.ad_valorem,
      regimen_legal: entry.regimen_legal || [],
      tiene_valoracion: entry.tiene_valoracion || false,
      total_tributos: entry.total_tributos || null,
      total_importacion: entry.total_importacion || null,
    }
    history.unshift(newEntry)
    const trimmed = history.slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
    return newEntry
  } catch (e) {
    console.warn('Error guardando historial:', e)
    return null
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY) } catch {}
}

export function deleteHistoryEntry(id) {
  try {
    const history = getHistory().filter(e => e.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {}
}
