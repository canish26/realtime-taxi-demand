export function generateBatch(rate: number) {
  return Array.from({ length: rate }, () => ({
    lat: 40.7 + Math.random() * 0.1,
    lng: -74.0 + Math.random() * 0.1,
    ts: Date.now()
  }))
}
