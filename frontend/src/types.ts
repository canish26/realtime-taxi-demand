export type PickupEvent = {
  lat: number
  lng: number
  ts: number
}

export type Anomaly = {
  ts: number
  score: number
  message: string
}

export type AggregatedCell = {
  cellId: string
  count: number
  lat: number
  lng: number
}
