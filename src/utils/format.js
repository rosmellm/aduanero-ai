export function fmtCurrency(n, currency = 'USD') {
  if (n == null || n === undefined) return '—'
  return `${currency} ${parseFloat(n).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
