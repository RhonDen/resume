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

  const token = String(payload?.token ?? '').trim()
  if (!token) return json(res, 401, { ok: false })

  const store = globalThis.__ACCESS_TOKENS__
  if (!store) return json(res, 401, { ok: false })

  const entry = store.get(token)
  if (!entry) return json(res, 401, { ok: false })
  if (Date.now() > entry.exp) {
    store.delete(token)
    return json(res, 401, { ok: false })
  }

  return json(res, 200, { ok: true, tier: entry.tier })
}

