const HISTORY_KEY = 'aduanero_ai_history'
const PERMITS_KEY = 'aduanero_ai_permits'
const BCV_KEY = 'aduanero_ai_bcv'
const MAX_HISTORY = 100

export function saveToHistory(entry) {
  try {
    const history = getHistory()
    const newEntry = { id: Date.now(), date: new Date().toISOString(), ...entry }
    history.unshift(newEntry)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
    return newEntry
  } catch (e) { console.warn('Error guardando historial:', e); return null }
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

export function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY) } catch {}
}

export function deleteHistoryEntry(id) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(e => e.id !== id)))
  } catch {}
}

// Permisos / agenda
export function getPermits() {
  try { return JSON.parse(localStorage.getItem(PERMITS_KEY) || '[]') } catch { return [] }
}

export function savePermit(permit) {
  try {
    const permits = getPermits()
    const newPermit = { id: Date.now(), ...permit }
    permits.unshift(newPermit)
    localStorage.setItem(PERMITS_KEY, JSON.stringify(permits))
    return newPermit
  } catch { return null }
}

export function deletePermit(id) {
  try {
    localStorage.setItem(PERMITS_KEY, JSON.stringify(getPermits().filter(p => p.id !== id)))
  } catch {}
}

export function getExpiringPermits(days = 30) {
  const permits = getPermits()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  return permits.filter(p => {
    if (!p.expiry) return false
    const exp = new Date(p.expiry)
    return exp <= cutoff
  })
}

// Tasa BCV
export function saveBCVRate(rate) {
  try { localStorage.setItem(BCV_KEY, JSON.stringify({ rate, date: new Date().toISOString() })) } catch {}
}

export function getBCVRate() {
  try { return JSON.parse(localStorage.getItem(BCV_KEY) || 'null') } catch { return null }
}
