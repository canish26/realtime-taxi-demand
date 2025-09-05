import express, { Request, Response } from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Server configuration
const PORT = parseInt(process.env.PORT || "4000")
const EMIT_INTERVAL_MS = parseInt(process.env.EMIT_INTERVAL_MS || "1000")
const SIMULATION_RATE = parseInt(process.env.SIMULATION_RATE || "300")
const CITY_CENTER_LAT = parseFloat(process.env.CITY_CENTER_LAT || "40.7128")
const CITY_CENTER_LNG = parseFloat(process.env.CITY_CENTER_LNG || "-74.0060")
const CITY_RADIUS_KM = parseFloat(process.env.CITY_RADIUS_KM || "18")

// Type definitions
interface PickupEvent {
  lat: number;
  lng: number;
  ts: number;
}

interface Anomaly {
  ts: number;
  score: number;
  message: string;
}

// Initialize Express app with CORS
const app = express()
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}))

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ status: 'Server is running' })
})

app.get("/health", (req: Request, res: Response) => {
  res.json({ ok: true })
})

// Status endpoint
app.get("/status", (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    clients: io.engine.clientsCount
  })
})

// Create HTTP server and Socket.io instance
const httpServer = createServer(app)
const io = new Server(httpServer, { 
  cors: { 
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true 
  } 
})

// Anomaly detection configuration
let threshold = 3
let lastCounts: number[] = []

// Generate random taxi demand data points
const generateBatch = (count: number): PickupEvent[] => {
  return Array.from({ length: count }, () => {
    // Random position within radius from city center
    const r = Math.sqrt(Math.random()) * CITY_RADIUS_KM / 111 // Convert to approximate degrees
    const theta = Math.random() * 2 * Math.PI
    
    return {
      lat: CITY_CENTER_LAT + r * Math.cos(theta),
      lng: CITY_CENTER_LNG + r * Math.sin(theta),
      ts: Date.now()
    }
  })
}

// Socket connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}. Total: ${io.engine.clientsCount}`)
  
  // Send initial batch of data
  const initialBatch = generateBatch(SIMULATION_RATE)
  socket.emit("pickup_batch", initialBatch)
  
  socket.on("set_threshold", (p: { threshold?: number }) => {
    threshold = p?.threshold ?? threshold
    console.log("Threshold updated:", threshold)
  })
  
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}. Total: ${io.engine.clientsCount}`)
  })
})

// Main simulation interval
setInterval(() => {
  if (io.engine.clientsCount > 0) {
    const batch = generateBatch(SIMULATION_RATE)
    io.emit("pickup_batch", batch)
    
    // Anomaly detection logic
    lastCounts.push(batch.length)
    const maxBuckets = Math.max(1, Math.floor(60_000 / EMIT_INTERVAL_MS))
    if (lastCounts.length > maxBuckets) lastCounts.shift()
    
    const mean = lastCounts.reduce((a, b) => a + b, 0) / lastCounts.length
    const variance = lastCounts.reduce((s, v) => s + (v - mean) ** 2, 0) / lastCounts.length
    const sd = Math.sqrt(variance)
    const z = sd === 0 ? 0 : (batch.length - mean) / sd
    
    // Emit anomaly if threshold exceeded
    if (z >= threshold) {
      io.emit("anomaly", {
        ts: Date.now(),
        score: z,
        message: `Spike: ${batch.length} pickups`
      })
    }
    
    // Randomly generate anomalies occasionally regardless of threshold
    if (Math.random() < 0.05) {
      io.emit("anomaly", {
        ts: Date.now(),
        score: 2 + Math.random() * 3,
        message: 'Unusual taxi activity detected'
      })
    }
  }
}, EMIT_INTERVAL_MS)

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`WebSocket server available at ws://localhost:${PORT}`)
  console.log(`Emitting ${SIMULATION_RATE} events every ${EMIT_INTERVAL_MS}ms`)
})