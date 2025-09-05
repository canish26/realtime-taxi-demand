import React from 'react'
import type { Anomaly } from '../types'

export default function AnomalyTicker({ items }: { items: Anomaly[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="font-semibold mb-2">Anomalies</div>
      <div className="h-24 overflow-y-auto space-y-1">
        {items.length === 0 && (
          <div className="text-gray-500 text-sm">No anomalies</div>
        )}
        {items
          .slice()
          .reverse()
          .map((a, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span
                className={`badge ${
                  a.score > 4
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                z={a.score.toFixed(2)}
              </span>
              <span className="text-sm text-gray-700">{a.message}</span>
              <span className="text-xs text-gray-400">
                {new Date(a.ts).toLocaleTimeString()}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}
