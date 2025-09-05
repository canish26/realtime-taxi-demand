/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import MapHeatmap from './components/MapHeatmap'
import AnomalyTicker from './components/AnomalyTicker'
import './App.css'
import type { PickupEvent, Anomaly } from './types'

// Limit points to prevent performance issues
const MAX_POINTS = 5000

// Connect to WebSocket server
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
console.log(`Connecting to socket server at: ${socketUrl}`)
const socket = io(socketUrl)

function App() {
  const [points, setPoints] = useState<PickupEvent[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connection status tracking
    socket.on("connect", () => {
      console.log("Socket connected")
      setConnected(true)
    })
    
    socket.on("disconnect", () => {
      console.log("Socket disconnected")
      setConnected(false)
    })

    // Data handling
    socket.on("pickup_batch", (batch: PickupEvent[]) => {
      console.log(`Received ${batch.length} points`)
      setPoints(prev => {
        // Keep only the most recent points up to MAX_POINTS
        const combined = [...prev, ...batch]
        return combined.slice(Math.max(0, combined.length - MAX_POINTS))
      })
    })

    socket.on("anomaly", (anomaly: Anomaly) => {
      console.log("Received anomaly", anomaly)
      setAnomalies(prev => {
        // Keep only the most recent 10 anomalies
        const updated = [...prev, anomaly]
        return updated.slice(-10)
      })
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("pickup_batch")
      socket.off("anomaly")
    }
  }, [])

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Real-time Taxi Demand</h1>
        <div className={`text-sm ${connected ? 'text-green-500' : 'text-red-500'}`}>
          {connected ? 'Connected to server' : 'Disconnected from server'}
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <MapHeatmap points={points} />
        </div>
        <div className="space-y-4">
          <div className="card">
            <div className="font-semibold mb-2">Statistics</div>
            <div className="text-2xl font-bold">{points.length} pickups</div>
            <div className="text-sm text-gray-500">in viewport</div>
          </div>
          
          <AnomalyTicker items={anomalies} />
        </div>
      </div>

      {!connected && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          Disconnected from server. Attempting to reconnect...
        </div>
      )}
    </div>
  )
}

export default App