/**
 * lib/chart-utils.ts
 *
 * Funciones puras compartidas por los tres componentes de visualización del
 * carril David (SolarArc.tsx, ValidationChart.tsx, PowerChart.tsx).
 *
 * REGLAS (ver design.md, sección "Funciones clave con especificación formal"):
 * - 100% funciones puras: sin `fetch`, sin importar `lib/providers.ts` ni
 *   `lib/normalize.ts`, sin leer variables de entorno.
 * - Nunca retornan `NaN`/`Infinity`: siempre son totales (no lanzan excepción
 *   ni propagan valores no finitos a quien las llama).
 *
 * Validates: Requirements 4.1, 4.2
 */

import type { HourlyPoint } from './types'

/* ------------------------------------------------------------------ */
/* Constantes visuales compartidas (carril David — telemetría SpaceX) */
/* ------------------------------------------------------------------ */

/**
 * Paleta compartida por los tres componentes. Ámbar reservado SOLO para el
 * dato "propio" (sol, poa, powerKw); blanco/gris a baja opacidad para el
 * resto (trayectoria, ejes, grilla, panel, serie externa gtiApi/powerOptimalKw).
 */
export const CHART_COLORS = {
  background: '#000000',
  accent: '#F0A31A',
  secondary: 'rgba(255,255,255,0.4)',
  grid: 'rgba(255,255,255,0.15)',
  axis: 'rgba(255,255,255,0.3)',
} as const

/** Hairlines de trazo (0.5px–1px) para SVG/Recharts, sin trazos gruesos. */
export const CHART_STROKE_WIDTH = {
  hairline: 0.75,
  hairlineThin: 0.5,
} as const

/** Tipografía monoespaciada de telemetría, compartida por los tres componentes. */
export const CHART_FONT_FAMILY = "'Roboto Mono', monospace"

/** Geometría del `viewBox="0 0 400 220"` de SolarArc, con horizonte en y=200. */
export const SOLAR_ARC_VIEWBOX = {
  width: 400,
  height: 220,
  horizonY: 200,
  maxElevation: 90,
} as const

/* ------------------------------------------------------------------ */
/* Tipos de salida para Recharts                                      */
/* ------------------------------------------------------------------ */

/**
 * Punto saneado listo para Recharts: solo campos numéricos finitos
 * (o `null` explícito en `gtiApi`, para que Recharts no interpole).
 */
export interface ChartPoint {
  ts: number
  poa: number
  gtiApi: number | null
  powerKw: number
  powerOptimalKw: number
}

/* ------------------------------------------------------------------ */
/* Funciones puras                                                    */
/* ------------------------------------------------------------------ */

/**
 * Mapea una elevación solar (grados) a una coordenada `y` de SVG.
 *
 * Precondición: `horizonY` y `maxElevation` son constantes fijas del
 * componente (200 y 90 respectivamente); `elevation` puede ser negativa.
 * Postcondición: retorna siempre un número finito, nunca lanza excepción.
 */
export function elevationToY(elevation: number, horizonY: number, maxElevation: number): number {
  const safeMaxElevation = Number.isFinite(maxElevation) && maxElevation !== 0 ? maxElevation : SOLAR_ARC_VIEWBOX.maxElevation
  const safeHorizonY = Number.isFinite(horizonY) ? horizonY : SOLAR_ARC_VIEWBOX.horizonY
  const safeElevation = Number.isFinite(elevation) ? elevation : 0

  const y = safeHorizonY - (safeElevation / safeMaxElevation) * 180

  return Number.isFinite(y) ? y : safeHorizonY
}

/**
 * Construye el atributo `d` de un `<path>` SVG a partir de una serie de
 * `HourlyPoint` ordenada por `ts` ascendente.
 *
 * Precondición: `points` puede estar vacío.
 * Postcondición: retorna `""` si no hay puntos válidos; cada segmento usa
 * únicamente coordenadas finitas. Puntos con `elevation`/`azimuth`/`ts` no
 * finitos se omiten del path.
 */
export function buildArcPath(points: HourlyPoint[]): string {
  if (!Array.isArray(points) || points.length === 0) return ''

  const validPoints = points.filter(
    (p) => Number.isFinite(p.ts) && Number.isFinite(p.sun.elevation) && Number.isFinite(p.sun.azimuth)
  )

  if (validPoints.length === 0) return ''

  const minTs = validPoints[0].ts
  const maxTs = validPoints[validPoints.length - 1].ts
  const tsRange = maxTs - minTs

  let path = ''

  validPoints.forEach((point, index) => {
    const x = tsRange > 0 ? ((point.ts - minTs) / tsRange) * SOLAR_ARC_VIEWBOX.width : 0
    const y = elevationToY(point.sun.elevation, SOLAR_ARC_VIEWBOX.horizonY, SOLAR_ARC_VIEWBOX.maxElevation)

    if (!Number.isFinite(x) || !Number.isFinite(y)) return

    path += path.length === 0 ? `M ${x},${y}` : ` L ${x},${y}`
  })

  return path
}

/** Resultado de partir una serie temporal en tramo recorrido y restante. */
export interface SplitTraveledResult {
  traveled: HourlyPoint[]
  remaining: HourlyPoint[]
}

/**
 * Divide `points` (ordenado por `ts` ascendente) en el tramo ya recorrido
 * (`ts <= nowTs`) y el restante, preservando el orden relativo original.
 *
 * Postcondición: `traveled.length + remaining.length === points.length`.
 */
export function splitTraveled(points: HourlyPoint[], nowTs: number): SplitTraveledResult {
  if (!Array.isArray(points)) return { traveled: [], remaining: [] }

  const traveled: HourlyPoint[] = []
  const remaining: HourlyPoint[] = []

  for (const point of points) {
    if (Number.isFinite(point.ts) && point.ts <= nowTs) {
      traveled.push(point)
    } else {
      remaining.push(point)
    }
  }

  return { traveled, remaining }
}

/**
 * Calcula el error medio porcentual entre `poa` (propio) y `gtiApi` (Open-Meteo),
 * filtrando puntos con `gtiApi === null || gtiApi <= 20` para evitar división
 * por valores chicos que hacen explotar el error relativo.
 *
 * Postcondición: retorna un número finito en `[0, +∞)`; retorna exactamente
 * `0` cuando no hay puntos válidos tras el filtro.
 */
export function computeMeanErrorPct(points: HourlyPoint[]): number {
  if (!Array.isArray(points) || points.length === 0) return 0

  const validPoints = points.filter(
    (p) => p.gtiApi !== null && Number.isFinite(p.gtiApi) && p.gtiApi > 20 && Number.isFinite(p.poa)
  )

  if (validPoints.length === 0) return 0

  const totalErrorPct = validPoints.reduce((sum, p) => {
    const gtiApi = p.gtiApi as number
    return sum + Math.abs(p.poa - gtiApi) / gtiApi
  }, 0)

  const meanErrorPct = (totalErrorPct / validPoints.length) * 100

  return Number.isFinite(meanErrorPct) && meanErrorPct >= 0 ? meanErrorPct : 0
}

/**
 * Transforma `HourlyPoint[]` en `ChartPoint[]` saneado para Recharts:
 * cualquier campo numérico no finito se reemplaza por `0` (o `null` en
 * `gtiApi`, para que Recharts no interpole sobre el eje).
 *
 * Compartida por `ValidationChart.tsx` y `PowerChart.tsx`.
 */
export function toChartSeries(points: HourlyPoint[]): ChartPoint[] {
  if (!Array.isArray(points)) return []

  return points.map((p) => ({
    ts: Number.isFinite(p.ts) ? p.ts : 0,
    poa: Number.isFinite(p.poa) ? p.poa : 0,
    gtiApi: p.gtiApi !== null && Number.isFinite(p.gtiApi) ? p.gtiApi : null,
    powerKw: Number.isFinite(p.powerKw) ? p.powerKw : 0,
    powerOptimalKw: Number.isFinite(p.powerOptimalKw) ? p.powerOptimalKw : 0,
  }))
}
