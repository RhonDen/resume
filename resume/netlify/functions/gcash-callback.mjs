import crypto from 'crypto'

export default async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload = {}
  if (req.method === 'POST') {
    try {
      payload = await req.json()
    } catch {
      payload = {}
    }
  }

  const tier = String(payload?.tier || 'basic').toLowerCase()

  const token = crypto.randomBytes(24).toString('hex')

  globalThis.__ACCESS_TOKENS__ ||= new Map()
  globalThis.__ACCESS_TOKENS__.set(token, {
    tier,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  })

  return Response.json({ ok: true, token, tier })
}
