import crypto from 'crypto'

const GIFT_CODES = new Map([
  ['ACCESS-RESUME-2026', { tier: 'basic', redeemed: false }],
  ['JOKE-RESUME', { tier: 'basic', redeemed: false }],
])

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const codeRaw = String(payload?.code ?? '').trim()
  if (!codeRaw) return Response.json({ error: 'code is required' }, { status: 400 })

  const code = codeRaw.toUpperCase()

  const entry = GIFT_CODES.get(code)
  if (!entry) return Response.json({ error: 'Invalid gift code' }, { status: 404 })
  if (entry.redeemed) return Response.json({ error: 'Gift code already redeemed' }, { status: 409 })

  entry.redeemed = true

  const token = crypto.randomBytes(24).toString('hex')

  globalThis.__ACCESS_TOKENS__ ||= new Map()
  globalThis.__ACCESS_TOKENS__.set(token, {
    tier: entry.tier,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  })

  return Response.json({ ok: true, token, tier: entry.tier })
}
