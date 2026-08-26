/**
 * components/SolarArc.tsx
 *
 * Gemelo digital del arco solar (carril David, must-have).
 *
 * Server Component: no requiere interactividad ni APIs de navegador, así que
 * no lleva `'use client'` (design.md, sección "Performance Considerations").
 *
 * Esta primera pasada (subtarea 2.1) implementa únicamente el esqueleto SVG
 * y el sistema de coordenadas dentro de `viewBox="0 0 400 220"`:
 * - El mapeo `y` reutiliza `elevationToY` de `lib/chart-utils.ts` (no se
 *   duplica su lógica).
 * - El mapeo `x` (`elevationToX`) es local a este componente: interpola
 *   linealmente `sun.ts` entre el primer punto (amanecer) y el último punto
 *   (atardecer) de `points`, según el algoritmo de `design.md`.
 * - `sunToPoint` combina ambos mapeos en una coordenada `{ x, y }` lista
 *   para usar en las subtareas siguientes (trayectoria punteada, sol, panel).
 *
 * Esta segunda pasada (subtarea 2.2) agrega la trayectoria solar del día:
 * - `buildArcPath(points)` (de `lib/chart-utils.ts`) genera el `d` de la
 *   trayectoria completa, dibujada punteada (`strokeDasharray`) en gris de
 *   baja opacidad (`CHART_COLORS.secondary`).
 * - `splitTraveled(points, now.ts)` (de `lib/chart-utils.ts`) separa el
 *   tramo ya recorrido; `buildArcPath(traveled)` genera el `d` de ese tramo,
 *   dibujado sólido en ámbar (`CHART_COLORS.accent`) superpuesto a la
 *   trayectoria completa.
 *
 * Esta tercera pasada (subtarea 2.4) agrega el sol actual:
 * - Círculo ámbar (`CHART_COLORS.accent`) en `sunToPoint(now.sun, points)`,
 *   dibujado SOLO SI `now.sun.elevation > 0`, es finito, y las coordenadas
 *   resultantes (`x`, `y`) son también finitas.
 * - Regla no negociable del proyecto (design.md, Property 2): de noche
 *   (`elevation <= 0`) o ante valores no finitos, no se renderiza ningún
 *   elemento de sol — sin excepción.
 *
 * Todavía NO se implementa aquí el panel (subtarea 2.6).
 *
 * Validates: Requirements 1.3, 1.4, 5.3
 */

import type { HourlyPoint, PanelConfig, SunPosition } from '@/lib/types'
import {
  buildArcPath,
  CHART_COLORS,
  CHART_FONT_FAMILY,
  CHART_STROKE_WIDTH,
  elevationToY,
  SOLAR_ARC_VIEWBOX,
  splitTraveled,
} from '@/lib/chart-utils'

export interface SolarArcProps {
  points: HourlyPoint[]
  now: HourlyPoint
  panel: PanelConfig
}

/** Radio del círculo del sol (px), pequeño y sin sombra/gradiente (estilo SpaceX). */
const SUN_RADIUS = 6

/**
 * Mapea la marca de tiempo de una posición solar a una coordenada `x` de SVG,
 * interpolando linealmente entre el primer punto (amanecer) y el último
 * punto (atardecer) de `points`.
 *
 * Postcondición: retorna siempre un número finito, nunca lanza excepción.
 * Complementa a `elevationToY` (de `lib/chart-utils.ts`) para completar el
 * mapeo de coordenadas de `SolarArc`.
 */
export function elevationToX(sun: SunPosition, points: HourlyPoint[]): number {
  if (!Array.isArray(points) || points.length === 0) return 0

  const validPoints = points.filter((p) => Number.isFinite(p.ts))
  if (validPoints.length === 0) return 0

  const minTs = validPoints[0].ts
  const maxTs = validPoints[validPoints.length - 1].ts
  const tsRange = maxTs - minTs
  const safeTs = Number.isFinite(sun.ts) ? sun.ts : minTs

  const x = tsRange > 0 ? ((safeTs - minTs) / tsRange) * SOLAR_ARC_VIEWBOX.width : 0

  return Number.isFinite(x) ? x : 0
}

/**
 * Combina `elevationToX` y `elevationToY` en una coordenada SVG completa
 * `{ x, y }` para una posición solar dada, dentro del sistema de coordenadas
 * de `SOLAR_ARC_VIEWBOX`. Usado por las subtareas siguientes (trayectoria,
 * sol) para no repetir el mapeo.
 */
export function sunToPoint(sun: SunPosition, points: HourlyPoint[]): { x: number; y: number } {
  return {
    x: elevationToX(sun, points),
    y: elevationToY(sun.elevation, SOLAR_ARC_VIEWBOX.horizonY, SOLAR_ARC_VIEWBOX.maxElevation),
  }
}

export default function SolarArc({ points, now, panel }: SolarArcProps) {
  // El panel (2.6) se implementa en una subtarea posterior.
  void panel

  const fullPath = buildArcPath(points)
  const { traveled } = splitTraveled(points, now.ts)
  const traveledPath = buildArcPath(traveled)

  // Sol actual: SOLO si está sobre el horizonte y todo es finito (regla no
  // negociable del proyecto — ver design.md, Property 2).
  const isSunVisible = now.sun.elevation > 0 && Number.isFinite(now.sun.elevation)
  const sunPoint = isSunVisible ? sunToPoint(now.sun, points) : null
  const showSun = sunPoint !== null && Number.isFinite(sunPoint.x) && Number.isFinite(sunPoint.y)

  return (
    <svg
      viewBox={`0 0 ${SOLAR_ARC_VIEWBOX.width} ${SOLAR_ARC_VIEWBOX.height}`}
      role="img"
      aria-label="Arco solar del día"
      style={{ fontFamily: CHART_FONT_FAMILY, backgroundColor: CHART_COLORS.background }}
    >
      <rect x={0} y={0} width={SOLAR_ARC_VIEWBOX.width} height={SOLAR_ARC_VIEWBOX.height} fill={CHART_COLORS.background} />

      {/* Horizonte en y=200 (SOLAR_ARC_VIEWBOX.horizonY) */}
      <line
        x1={0}
        y1={SOLAR_ARC_VIEWBOX.horizonY}
        x2={SOLAR_ARC_VIEWBOX.width}
        y2={SOLAR_ARC_VIEWBOX.horizonY}
        stroke={CHART_COLORS.axis}
        strokeWidth={CHART_STROKE_WIDTH.hairline}
      />

      {/* Trayectoria completa del día, punteada (referencia, no es el dato "propio") */}
      {fullPath !== '' && (
        <path
          d={fullPath}
          fill="none"
          stroke={CHART_COLORS.secondary}
          strokeWidth={CHART_STROKE_WIDTH.hairline}
          strokeDasharray="4 3"
        />
      )}

      {/* Tramo ya recorrido, sólido en ámbar (dato "propio"/actual) */}
      {traveledPath !== '' && (
        <path
          d={traveledPath}
          fill="none"
          stroke={CHART_COLORS.accent}
          strokeWidth={CHART_STROKE_WIDTH.hairline}
        />
      )}

      {/* Sol actual: círculo ámbar, solo si está sobre el horizonte (elevation > 0 y finito) */}
      {showSun && sunPoint && (
        <circle cx={sunPoint.x} cy={sunPoint.y} r={SUN_RADIUS} fill={CHART_COLORS.accent} />
      )}
    </svg>
  )
}
