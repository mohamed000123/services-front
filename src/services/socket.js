import { io } from 'socket.io-client'

const url = import.meta.env.VITE_SOCKET_URL ?? window.location.origin

export function createSocket(options) {
  return io(url, { autoConnect: false, ...options })
}
