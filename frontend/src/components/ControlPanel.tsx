import React from 'react'


type Props = {
paused: boolean
setPaused: (v: boolean) => void
threshold: number
setThreshold: (v: number) => void
}


export default function ControlPanel({ paused, setPaused, threshold, setThreshold }: Props) {
return (
<div className="card flex items-center gap-4">
<button
onClick={() => setPaused(!paused)}
className={`px-4 py-2 rounded-xl shadow ${paused ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'}`}
>
{paused ? 'Resume' : 'Pause'} Stream
</button>
<label className="text-sm text-gray-700">Anomaly threshold (z):</label>
<input
type="range"
min={1}
max={5}
step={0.1}
value={threshold}
onChange={e => setThreshold(parseFloat(e.target.value))}
/>
<span className="text-sm font-medium">{threshold.toFixed(1)}</span>
</div>
)
}