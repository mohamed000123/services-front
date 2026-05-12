import axios from 'axios'

/**
 * Admin session JWT is issued by the API as an **httpOnly** cookie (not readable in JS).
 * `withCredentials` makes the browser attach that cookie on cross-origin requests when
 * the server allows it (`Access-Control-Allow-Credentials`, explicit `Allow-Origin`).
 *
 * We send optional `Authorization: Bearer` only when the login JSON includes a token.
 * For cookie-only login we persist **non-secret** fields from the JSON (`fullName`, `role`, …)
 * so the SPA knows login succeeded and can show the dashboard.
 */
axios.defaults.withCredentials = true

const baseURL = import.meta.env.BASE_API_URL?.trim() || '/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

const AUTH_TOKEN_KEY = 'admin_auth_token'
/**
 * Non-httpOnly snapshot from login JSON for UI / route gating only.
 * The real JWT stays in the httpOnly cookie — never stored here for cookie-based auth.
 */
const ADMIN_PROFILE_KEY = 'admin_auth_profile'
/** @deprecated legacy session flag — cleared in clearAdminAuth */
const LEGACY_AUTH_SESSION_KEY = 'admin_auth_session'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * @param {{ fullName?: string; role?: string; expiresIn?: number | null } | null} profile
 */
export function setAdminSessionProfile(profile) {
  if (!profile) {
    localStorage.removeItem(ADMIN_PROFILE_KEY)
    return
  }
  localStorage.setItem(
    ADMIN_PROFILE_KEY,
    JSON.stringify({
      fullName: profile.fullName ?? '',
      role: profile.role ?? '',
      expiresIn: profile.expiresIn ?? null,
      savedAt: Date.now(),
    }),
  )
}

export function getAdminSessionProfile() {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o || typeof o !== 'object') return null
    return o
  } catch {
    return null
  }
}

/** True if we have a bearer token in storage or a post-login profile (httpOnly cookie session). */
export function isAuthenticated() {
  return Boolean(getAuthToken() || getAdminSessionProfile())
}

export function clearAdminAuth() {
  setAuthToken(null)
  localStorage.removeItem(ADMIN_PROFILE_KEY)
  localStorage.removeItem(LEGACY_AUTH_SESSION_KEY)
}

api.interceptors.request.use((config) => {
  // httpOnly session cookie is sent by the browser automatically; Bearer is optional (e.g. token in JSON).
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const onLogin = window.location.pathname.startsWith('/login')
    if (status === 401 && !onLogin) {
      clearAdminAuth()
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)
