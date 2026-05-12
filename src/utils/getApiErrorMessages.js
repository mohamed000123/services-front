function looksLikeHtmlDoc(s) {
  const t = typeof s === 'string' ? s.trim() : ''
  return t.startsWith('<!DOCTYPE') || t.startsWith('<html')
}

function friendlyHttpMessage(status) {
  if (status === 401 || status === 403) {
    return 'Access denied or your session expired. Please sign in again.'
  }
  if (status === 404) {
    return 'The requested resource was not found.'
  }
  if (status === 429) {
    return 'Too many requests. Please wait and try again.'
  }
  if (typeof status === 'number' && status >= 500) {
    return 'The server had a problem. Please try again later.'
  }
  return null
}

/**
 * Extract human-readable messages from typical API / Axios error bodies
 * (e.g. express-validator `{ errors: [{ msg, path, ... }] }`).
 *
 * @param {unknown} err
 * @returns {string[]}
 */
export function getApiErrorMessages(err) {
  let data
  /** @type {number | undefined} */
  let httpStatus
  /** @type {string | undefined} */
  let errMessage

  if (err != null && typeof err === 'object') {
    const o = /** @type {Record<string, unknown>} */ (err)
    if (typeof o.message === 'string') errMessage = o.message

    const res = o.response
    if (res != null && typeof res === 'object' && !Array.isArray(res)) {
      const r = /** @type {Record<string, unknown>} */ (res)
      data = r.data
      if (typeof r.status === 'number') httpStatus = r.status
    }
  }

  if (data == null || data === '') {
    const hint = friendlyHttpMessage(httpStatus)
    if (hint) return [hint]
    return errMessage ? [errMessage] : ['Something went wrong']
  }

  if (typeof data === 'string') {
    if (looksLikeHtmlDoc(data)) {
      const hint = friendlyHttpMessage(httpStatus)
      return [hint || 'The server returned an unexpected response. Please try again or sign in.']
    }
    return [data]
  }

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const body = /** @type {Record<string, unknown>} */ (data)
    const { errors, message, error: errorField } = body

    if (Array.isArray(errors) && errors.length > 0) {
      const msgs = errors
        .map((item) => {
          if (typeof item === 'string') return item
          if (item != null && typeof item === 'object' && !Array.isArray(item)) {
            const row = /** @type {Record<string, unknown>} */ (item)
            if (typeof row.msg === 'string') return row.msg
            if (typeof row.message === 'string') return row.message
          }
          return null
        })
        .filter(Boolean)
      if (msgs.length) return /** @type {string[]} */ (msgs)
    }

    if (typeof message === 'string' && message.trim()) {
      return [message]
    }
    if (Array.isArray(message)) {
      const m = message.map(String).filter(Boolean)
      if (m.length) return m
    }

    if (typeof errorField === 'string' && errorField.trim()) {
      return [errorField]
    }

    if (typeof body.statusMessage === 'string' && body.statusMessage.trim()) {
      return [body.statusMessage]
    }
  }

  if (errMessage) return [errMessage]
  return ['Something went wrong']
}

/** @param {unknown} err */
export function getApiErrorMessage(err) {
  return getApiErrorMessages(err).join(' · ')
}
