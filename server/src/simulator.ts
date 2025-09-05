import { Server } from "socket.io"

export function simulateStream(io: Server) {
  setInterval(() => {
    const batch = Array.from({ length: 5 }, () => ({
      lat: 40.7 + Math.random() * 0.1,
      lng: -74.0 + Math.random() * 0.1,
      ts: Date.now()
    }))
    io.emit("demand", batch)
  }, 2000)
}
