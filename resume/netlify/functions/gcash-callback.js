import crypto from 'crypto'

// Payment provider callback endpoint (placeholder).
// You should verify the payment using GCash payment gateway webhook/callback payload.
// Then mark the user as paid (e.g., create access token) in a DB.

function json(res, status, body) {
  res.status(status).json(body)
}

export default async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  // TODO: parse and verify payload from GCash
  // Example placeholders:
  const payload = req.method === 'POST' ? req.body : {}
  const tier = String(payload?.tier || 'basic').toLowerCase()

  // Issue token placeholder for demo purposes.
  const token = crypto.randomBytes(24).toString('hex')

  globalThis.__ACCESS_TOKENS__ ||= new Map()
  globalThis.__ACCESS_TOKENS__.set(token, {
    tier,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  })

  return json(res, 200, { ok: true, token, tier })
}

