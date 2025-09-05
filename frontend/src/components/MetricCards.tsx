import React from 'react'


type Props = {
total: number
rate: number
windowAvg: number
}


export default function MetricCards({ total, rate, windowAvg }: Props) {
return (
<div className="grid grid-cols-3 gap-4">
<div className="card">
<div className="text-sm text-gray-500">Total pickups (session)</div>
<div className="text-3xl font-semibold">{total.toLocaleString()}</div>
</div>
<div className="card">
<div className="text-sm text-gray-500">Current rate (events/min)</div>
<div className="text-3xl font-semibold">{rate.toFixed(0)}</div>
</div>
<div className="card">
<div className="text-sm text-gray-500">5‑min moving avg</div>
<div className="text-3xl font-semibold">{windowAvg.toFixed(1)}</div>
</div>
</div>
)
}