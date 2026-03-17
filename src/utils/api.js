import { SYSTEM_PROMPT } from '../constants.js'

export async function callAduaneroAI(messages) {
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
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Error HTTP ${response.status}`)
  }

  const data = await response.json()
  const raw = data?.content?.[0]?.text || ''

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return { parsed: JSON.parse(clean), raw }
  } catch {
    throw new Error('El motor no pudo estructurar la respuesta. Intente reformular la consulta.')
  }
}
