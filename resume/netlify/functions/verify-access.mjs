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

  const token = String(payload?.token ?? '').trim()
  if (!token) return Response.json({ ok: false }, { status: 401 })

  const store = globalThis.__ACCESS_TOKENS__
  if (!store) return Response.json({ ok: false }, { status: 401 })

  const entry = store.get(token)
  if (!entry) return Response.json({ ok: false }, { status: 401 })
  if (Date.now() > entry.exp) {
    store.delete(token)
    return Response.json({ ok: false }, { status: 401 })
  }

  return Response.json({ ok: true, tier: entry.tier })
}
