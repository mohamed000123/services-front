import {
  api,
  clearAdminAuth,
  setAdminRefreshToken,
  setAdminSessionProfile,
  setAuthToken,
} from '@/services/api.js'

function pickToken(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const p = /** @type {Record<string, unknown>} */ (payload)
  const nestedRaw = p.data
  const nested =
    nestedRaw && typeof nestedRaw === 'object' && !Array.isArray(nestedRaw)
      ? /** @type {Record<string, unknown>} */ (nestedRaw)
      : null
  const asStr = (v) => (typeof v === 'string' && v ? v : null)
  return (
    asStr(p.token) ??
    asStr(p.accessToken) ??
    asStr(p.access_token) ??
    asStr(p.jwt) ??
    asStr(p.authToken) ??
    (nested && asStr(nested.token)) ??
    (nested && asStr(nested.accessToken)) ??
    (nested && asStr(nested.jwt)) ??
    null
  )
}

/**
 * Persist non-secret fields from the login JSON. Session JWT is httpOnly — not read here.
 * @param {unknown} data
 */
function syncSessionFromLoginBody(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    setAdminSessionProfile(null)
    return
  }
  const o = /** @type {Record<string, unknown>} */ (data)
  const hasProfile = typeof o.fullName === 'string' || typeof o.role === 'string'

  if (hasProfile) {
    setAdminSessionProfile({
      fullName: typeof o.fullName === 'string' ? o.fullName : '',
      role: typeof o.role === 'string' ? o.role : '',
      expiresIn: typeof o.expiresIn === 'number' ? o.expiresIn : null,
    })
  } else {
    setAdminSessionProfile(null)
  }
}

/**
 * POST /admin/auth/login.
 * On success the API sets the session **JWT in an httpOnly (typically SameSite) cookie**;
 * the JSON body is `{ fullName, role, expiresIn }` for display — not the secret token.
 * If the API returns a token in JSON, it is stored for `Authorization` only.
 * @param {{ email: string; password: string }} credentials
 */
export async function loginAdmin(credentials) {
  const { data } = await api.post('/admin/auth/login', credentials)
  const token = pickToken(data)

  if (token) setAuthToken(token)
  else setAuthToken(null)

  syncSessionFromLoginBody(data)

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = /** @type {Record<string, unknown>} */ (data)
    const rt = typeof o.refreshToken === 'string' ? o.refreshToken : ''
    setAdminRefreshToken(rt || null)
  } else {
    setAdminRefreshToken(null)
  }

  return data
}

/**
 * POST /admin/auth/logout — clears httpOnly session cookie on the server.
 * Client session (token + profile) is always cleared in `finally`.
 * @returns {Promise<{ message?: string } | unknown>}
 */
export async function logoutAdmin() {
  try {
    const { data } = await api.post('/admin/auth/logout')
    return data
  } finally {
    clearAdminAuth()
  }
}
