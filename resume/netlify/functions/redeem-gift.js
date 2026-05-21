import crypto from 'crypto'

const GIFT_CODES = new Map([
  // code -> { tier: 'basic'|'premium', redeemed: boolean }
  ['ACCESS-RESUME-2026', { tier: 'basic', redeemed: false }],
  ['JOKE-RESUME', { tier: 'basic', redeemed: false }],
])

function json(res, status, body) {
  res.status(status).json(body)
}

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  let payload
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return json(res, 400, { error: 'Invalid JSON' })
  }

  const codeRaw = String(payload?.code ?? '').trim()
  if (!codeRaw) return json(res, 400, { error: 'code is required' })

  // Normalize
  const code = codeRaw.toUpperCase()

  const entry = GIFT_CODES.get(code)
  if (!entry) return json(res, 404, { error: 'Invalid gift code' })
  if (entry.redeemed) return json(res, 409, { error: 'Gift code already redeemed' })

  // One-time redemption
  entry.redeemed = true

  // Issue a short-lived token for the frontend
  // NOTE: In production, use a real DB + JWT signing secret.
  const token = crypto.randomBytes(24).toString('hex')

  // In-memory token store (resets on cold start). Replace with DB.
  globalThis.__ACCESS_TOKENS__ ||= new Map()
  globalThis.__ACCESS_TOKENS__.set(token, {
    tier: entry.tier,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  })

  return json(res, 200, { ok: true, token, tier: entry.tier })
}

