/* eslint-disable react-refresh/only-export-components -- context + hook live together */
import { useLocation } from 'react-router-dom'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { isAuthenticated } from '@/services/api.js'

const RealtimeContext = createContext(null)

function apiOrigin() {
  const raw = import.meta.env.BASE_API_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/**
 * @typedef {'connecting' | 'live' | 'offline'} SocketConnectionStatus
 */

/**
 * @typedef {object} RealtimeContextValue
 * @property {import('socket.io-client').Socket | null} adminSocket
 * @property {SocketConnectionStatus} adminSocketStatus
 * @property {number | null} lastAdminEventAt
 */

export function RealtimeProvider({ children }) {
  const location = useLocation()
  const [adminSocket, setAdminSocket] = useState(null)
  /** @type {[SocketConnectionStatus, import('react').Dispatch<import('react').SetStateAction<SocketConnectionStatus>>]} */
  const [adminSocketStatus, setAdminSocketStatus] = useState('offline')
  const [lastAdminEventAt, setLastAdminEventAt] = useState(null)

  useEffect(() => {
    const onLogin = location.pathname !== '/login' && isAuthenticated()
    if (!onLogin) {
      setAdminSocket((prev) => {
        if (prev) prev.disconnect()
        return null
      })
      setAdminSocketStatus('offline')
      return undefined
    }

    const origin = apiOrigin()
    const socketPath = import.meta.env.VITE_SOCKET_PATH?.trim() || '/socket.io'
    const socket = io(`${origin}/realtime/admin`, {
      path: socketPath,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    setAdminSocketStatus('connecting')
    setAdminSocket(socket)

    const bump = () => setLastAdminEventAt(Date.now())

    const onConnect = () => setAdminSocketStatus('live')
    const onDisconnect = () => setAdminSocketStatus('offline')
    const onConnectError = () => setAdminSocketStatus('offline')

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.on('request:created', bump)
    socket.on('request:status_changed', bump)
    socket.on('request:updated', bump)
    socket.on('request:deleted', bump)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.off('request:created', bump)
      socket.off('request:status_changed', bump)
      socket.off('request:updated', bump)
      socket.off('request:deleted', bump)
      socket.disconnect()
      setAdminSocket(null)
      setAdminSocketStatus('offline')
    }
  }, [location.pathname])

  const value = useMemo(
    () => ({
      adminSocket,
      adminSocketStatus,
      lastAdminEventAt,
    }),
    [adminSocket, adminSocketStatus, lastAdminEventAt],
  )

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

/** @returns {RealtimeContextValue} */
export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  if (!ctx) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }
  return ctx
}
