function getToken() {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  } catch (e) {
    return null
  }
}

async function request(method, url, body, opts = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
  const full = url && (url.startsWith('http') ? url : `${base}${url}`)

  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(full, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: opts.signal,
    })
  } catch (networkErr) {
    const err = new Error(`Network request failed: ${networkErr.message}`)
    err.status = 0
    err.info = networkErr
    throw err
  }

  // network-level errors (DNS, refused connection, CORS preflight failures, offline)
  // will reject the fetch promise — wrap to provide a clearer error

  if (!res.ok) {
    const text = await res.text()
    const err = new Error('Request failed')
    err.status = res.status
    try { err.info = JSON.parse(text) } catch (e) { err.info = text }
    throw err
  }

  // some endpoints may return empty body
  const txt = await res.text()
  try {
    return txt ? JSON.parse(txt) : null
  } catch (e) {
    return txt
  }
}

export const api = {
  get: (url, opts) => request('GET', url, null, opts),
  post: (url, body, opts) => request('POST', url, body, opts),
  put: (url, body, opts) => request('PUT', url, body, opts),
  del: (url, opts) => request('DELETE', url, null, opts),
}

export default api
