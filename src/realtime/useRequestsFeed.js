import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/services/api.js'
import { useRealtime } from '@/realtime/RealtimeProvider.jsx'

function normalizeStatus(s) {
  if (!s || typeof s !== 'string') return 'pending'
  const u = s.toUpperCase()
  if (u === 'IN_PROGRESS') return 'in-progress'
  return u.toLowerCase()
}

function mapRow(r) {
  if (!r || typeof r !== 'object') return null
  const id = r.id
  const serviceName = r.service?.name ?? r.serviceName ?? '—'
  const requester = r.client?.fullName ?? r.clientName ?? '—'
  const created = r.createdAt ? new Date(r.createdAt) : null
  const createdLabel = created
    ? `${created.toLocaleDateString()} · ${created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '—'
  return {
    id,
    service: serviceName,
    requester,
    created: createdLabel,
    status: normalizeStatus(r.status),
    raw: r,
  }
}

const DEFAULT_META = { page: 1, limit: 20, total: 0 }

/**
 * Live service requests for the admin monitor: paginated REST load + Socket.io refresh on events.
 */
export function useRequestsFeed() {
  const { adminSocket } = useRealtime()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [meta, setMeta] = useState(DEFAULT_META)
  const hasLoadedOnceRef = useRef(false)

  const load = useCallback(
    async (opts = {}) => {
      /** After first successful fetch, default to background refresh (pagination / effect) unless forced off. */
      const silent = opts.silent ?? hasLoadedOnceRef.current
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)
      try {
        const { data } = await api.get('/admin/requests', {
          params: { limit, page, sort: 'desc' },
        })
        const list = Array.isArray(data?.data) ? data.data : []
        setRows(list.map((r) => mapRow(r)).filter(Boolean))
        const m = data?.meta
        if (m && typeof m === 'object') {
          setMeta({
            page: Number(m.page) || page,
            limit: Number(m.limit) || limit,
            total: Number(m.total) || 0,
          })
        } else {
          setMeta({ page, limit, total: list.length })
        }
        hasLoadedOnceRef.current = true
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [limit, page],
  )

  useEffect(() => {
    void load()
  }, [load])

  /** Keep page in range if total shrinks (e.g. after filter elsewhere). */
  useEffect(() => {
    const total = Number(meta.total) || 0
    const lim = Number(meta.limit) || limit
    const tp = Math.max(1, Math.ceil(total / lim) || 1)
    if (page > tp) {
      setPage(tp)
    }
  }, [meta.limit, meta.total, page, limit])

  useEffect(() => {
    if (!adminSocket) return undefined

    const bump = () => {
      void load({ silent: true })
    }

    adminSocket.on('request:created', bump)
    adminSocket.on('request:status_changed', bump)
    adminSocket.on('request:updated', bump)
    adminSocket.on('request:deleted', bump)

    return () => {
      adminSocket.off('request:created', bump)
      adminSocket.off('request:status_changed', bump)
      adminSocket.off('request:updated', bump)
      adminSocket.off('request:deleted', bump)
    }
  }, [adminSocket, load])

  const setLimitAndReset = useCallback((next) => {
    setLimit(next)
    setPage(1)
  }, [])

  return useMemo(
    () => ({
      rows,
      loading,
      refreshing,
      error,
      reload: load,
      meta,
      page,
      setPage,
      limit,
      setLimit: setLimitAndReset,
    }),
    [rows, loading, refreshing, error, load, meta, page, limit, setLimitAndReset],
  )
}
