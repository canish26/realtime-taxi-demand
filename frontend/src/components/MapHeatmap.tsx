import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet.heat'
// @ts-ignore
import * as L from 'leaflet'
import type { PickupEvent } from '../types'

function HeatLayer({ points }: { points: PickupEvent[] }) {
  const map = useMap()
  const heatRef = useRef<any>(null)

  // Force Leaflet to recalc size once mounted
  useEffect(() => {
    map.invalidateSize()
  }, [map])

  useEffect(() => {
    if (!map) return
    if (map.getSize().y === 0) return // avoid zero height canvas crash

    if (!heatRef.current) {
      // @ts-ignore
      heatRef.current = (L as any).heatLayer([], { radius: 25, blur: 15 }).addTo(map)
    }

    const latlngs = points.map(p => [p.lat, p.lng, 0.5])
    heatRef.current.setLatLngs(latlngs)
  }, [points, map])

  return null
}

export default function MapHeatmap({ points }: { points: PickupEvent[] }) {
  const center: [number, number] = [40.7128, -74.006]
  const tileUrl =
    import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-lg"
      style={{ height: '70vh', minHeight: '400px' }}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors" />
        <HeatLayer points={points} />
      </MapContainer>
    </div>
  )
}
