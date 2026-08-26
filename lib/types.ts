/** Azimut en convención BRÚJULA: 0 = N, 90 = E, 180 = S, 270 = O. Ver §1 del Plan. */
export type CompassAzimuth = number

export interface Coords { lat: number; lon: number; label: string }

export interface PanelConfig {
  azimuth: CompassAzimuth
  tilt: number              // 0 = horizontal, 90 = vertical
  areaM2: number
  efficiency: number        // 0.20 = módulo del 20 %
  performanceRatio: number  // 0.85 — inversor, cableado, mismatch. Se cancela en el %
}

export interface SunPosition {
  ts: number                // epoch ms, UTC. NUNCA un string sin offset.
  elevation: number         // grados; negativo = de noche
  azimuth: CompassAzimuth
}

export interface HourlyPoint {
  ts: number                // epoch ms, UTC
  sun: SunPosition
  ghi: number               // W/m²
  dni: number
  dhi: number               // difuso horizontal — SE USA, no se aproxima
  poa: number               // irradiancia en el plano del panel (lo que calculamos)
  gtiApi: number | null     // el mismo POA según Open-Meteo → gráfico de validación
  cosIncidence: number      // ya clampeado a [0, 1]
  cloudCover: number        // 0-100
  temperature: number       // °C
  powerKw: number
  powerOptimalKw: number    // con la mejor orientación FIJA, no con seguimiento
}

export interface Orientation { azimuth: CompassAzimuth; tilt: number }

export interface DayForecast {
  date: string              // YYYY-MM-DD en hora local del sitio
  points: HourlyPoint[]
  totalKwh: number
  optimalKwh: number
  lossPct: number           // 0 si totalKwh ≈ 0. Nunca NaN, nunca Infinity
}

export interface Recommendation {
  id: string
  severity: 'info' | 'action' | 'urgent'
  title: string
  body: string
  formula?: string          // se muestra en pantalla: es el diferencial del proyecto
  gainPct?: number
  gainKwh?: number
}

export interface AirQuality {
  pm10: number; pm2_5: number; usAqi: number
  dust: number              // NO opcional: si falta, 0 (ver §3 · Cain)
}

export interface AiStats {
  computations: number      // evaluaciones reales del motor
  llmCalls: number
  whEstimated: number       // llmCalls × 0.24 Wh (Google, arXiv 2508.15734)
}

export interface Meta {
  source: 'live' | 'fallback'
  generatedAt: number
  utcOffsetSeconds: number  // SOLO para formatear. Nunca para calcular.
}

export interface DashboardPayload {
  meta: Meta
  coords: Coords
  panel: PanelConfig
  optimal: Orientation
  now: HourlyPoint
  today: DayForecast
  forecast: DayForecast[]
  air: AirQuality
  recommendations: Recommendation[]
  aiStats: AiStats
}
