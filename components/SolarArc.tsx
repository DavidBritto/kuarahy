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
import type { SolariaToolAction } from '@/lib/agent/decider-tool-selection'
import type { Locale } from '@/lib/i18n'
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
  mode?: SolariaToolAction
  trackerTiltDeg?: number
  isRaining?: boolean
  locale?: Locale
}

const SUN_RADIUS = 6

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

export function sunToPoint(sun: SunPosition, points: HourlyPoint[]): { x: number; y: number } {
  return {
    x: elevationToX(sun, points),
    y: elevationToY(sun.elevation, SOLAR_ARC_VIEWBOX.horizonY, SOLAR_ARC_VIEWBOX.maxElevation),
  }
}

export default function SolarArc({
  points,
  now,
  panel,
  mode = 'adjust_solar_tracker',
  trackerTiltDeg,
  isRaining = false,
  locale = 'en',
}: SolarArcProps) {
  const fullPath = buildArcPath(points)
  const { traveled } = splitTraveled(points, now.ts)
  const traveledPath = buildArcPath(traveled)

  // Sol actual: SOLO si está sobre el horizonte y todo es finito
  const isSunVisible = now.sun.elevation > 0 && Number.isFinite(now.sun.elevation)
  const sunPoint = isSunVisible ? sunToPoint(now.sun, points) : null
  const showSun = sunPoint !== null && Number.isFinite(sunPoint.x) && Number.isFinite(sunPoint.y)

  // Mechatronics geometry (Pivot at x=200, y=165)
  const pivotX = 200
  const pivotY = 165
  const panelLength = 68
  const halfLen = panelLength / 2
  const normalLen = 32

  // Unit vector normal to the panel face (pointing out from active PV surface towards sky/sun)
  let nx = 0
  let ny = -1 // Default: perpendicular pointing straight up towards zenith (0° tilt)

  if (mode === 'clean_panels_rainwash') {
    // 65° steep rainwash angle for gravity water runoff
    const angleRad = (65 * Math.PI) / 180
    nx = Math.sin(angleRad)
    ny = -Math.cos(angleRad)
  } else if (mode === 'storm_safeguard') {
    // 0° aerodynamic defense stow: completely flat horizontal
    nx = 0
    ny = -1
  } else if (showSun && sunPoint) {
    // Active solar tracking: point normal vector directly towards sun position
    const dx = sunPoint.x - pivotX
    const dy = sunPoint.y - pivotY
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0.001) {
      // Zenith angle in degrees: negative = morning (left/east), positive = afternoon (right/west)
      const zenithAngleDeg = Math.atan2(dx, -dy) * (180 / Math.PI)
      // Clamped to physical tracker slew drive mechanical limit: [-60°, +60°]
      const clampedAngleDeg = Math.max(-60, Math.min(60, zenithAngleDeg))
      const rad = (clampedAngleDeg * Math.PI) / 180
      nx = Math.sin(rad)
      ny = -Math.cos(rad)
    }
  }

  // Tangent vector along the panel (strictly perpendicular to surface normal):
  // When normal is (nx, ny), tangent is (-ny, nx). Since ny is negative, -ny > 0 (points rightward).
  const tx = -ny
  const ty = nx

  // Panel endpoints
  const x1 = pivotX - halfLen * tx
  const y1 = pivotY - halfLen * ty
  const x2 = pivotX + halfLen * tx
  const y2 = pivotY + halfLen * ty

  // Normal vector tip (points into the sky towards the sun)
  const normalX = pivotX + normalLen * nx
  const normalY = pivotY + normalLen * ny

  // Active PV face offset 2px in direction of normal (towards sun)
  const pvOffset = 2.5
  const fx1 = x1 + pvOffset * nx
  const fy1 = y1 + pvOffset * ny
  const fx2 = x2 + pvOffset * nx
  const fy2 = y2 + pvOffset * ny

  // Back chassis offset 2px opposite to normal (towards ground)
  const bx1 = x1 - 2 * nx
  const by1 = y1 - 2 * ny
  const bx2 = x2 - 2 * nx
  const by2 = y2 - 2 * ny

  const horizonText = locale === 'es' ? 'HORIZONTE 0°' : 'HORIZON 0°'
  const sunText = locale === 'es' ? 'SOL' : 'SUN'
  const rainwashText = locale === 'es' ? '🌧️ AUTOLAVADO 65°' : '🌧️ RAINWASH 65°'
  const mechatronicsPrefix = locale === 'es' ? 'MECATRÓNICA' : 'MECHATRONICS'

  return (
    <svg
      viewBox={`0 0 ${SOLAR_ARC_VIEWBOX.width} ${SOLAR_ARC_VIEWBOX.height}`}
      role="img"
      aria-label={locale === 'es' ? 'Gemelo Digital del Arco Solar y Mecatrónica SolariA' : 'SolariA Solar Arc & Mechatronics Digital Twin'}
      style={{ fontFamily: CHART_FONT_FAMILY, backgroundColor: CHART_COLORS.background }}
      className="w-full h-auto select-none"
    >
      <defs>
        {/* Arrow marker for surface normal vector */}
        <marker
          id="normalArrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#F0A31A" />
        </marker>
        {/* Glowing gradient for incoming solar flux */}
        <linearGradient id="solarFluxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0A31A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F0A31A" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={SOLAR_ARC_VIEWBOX.width} height={SOLAR_ARC_VIEWBOX.height} fill={CHART_COLORS.background} />

      {/* Grid lines for elevation */}
      <line x1={0} y1={120} x2={400} y2={120} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
      <line x1={0} y1={60} x2={400} y2={60} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
      <text x={8} y={116} fill="rgba(255,255,255,0.25)" fontSize={8}>45° ELV</text>
      <text x={8} y={56} fill="rgba(255,255,255,0.25)" fontSize={8}>75° ELV</text>

      {/* Ground Horizon (y=200) */}
      <line
        x1={0}
        y1={SOLAR_ARC_VIEWBOX.horizonY}
        x2={SOLAR_ARC_VIEWBOX.width}
        y2={SOLAR_ARC_VIEWBOX.horizonY}
        stroke={CHART_COLORS.axis}
        strokeWidth={CHART_STROKE_WIDTH.hairline}
      />
      <text x={340} y={212} fill="rgba(255,255,255,0.3)" fontSize={9}>{horizonText}</text>

      {/* Trayectoria completa del día, punteada */}
      {fullPath !== '' && (
        <path
          d={fullPath}
          fill="none"
          stroke={CHART_COLORS.secondary}
          strokeWidth={CHART_STROKE_WIDTH.hairline}
          strokeDasharray="4 3"
        />
      )}

      {/* Tramo ya recorrido en ámbar */}
      {traveledPath !== '' && (
        <path
          d={traveledPath}
          fill="none"
          stroke={CHART_COLORS.accent}
          strokeWidth={CHART_STROKE_WIDTH.hairline}
        />
      )}

      {/* Sun rays streaming directly to ACTIVE PV FACE */}
      {showSun && sunPoint && (
        <g opacity={0.65} className="transition-all duration-300">
          {/* Main center ray to active surface */}
          <line
            x1={sunPoint.x}
            y1={sunPoint.y}
            x2={pivotX + 2.5 * nx}
            y2={pivotY + 2.5 * ny}
            stroke="#F0A31A"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          {/* Edge rays showing flux coverage on the panel face */}
          <line
            x1={sunPoint.x}
            y1={sunPoint.y}
            x2={fx1}
            y2={fy1}
            stroke="#F0A31A"
            strokeWidth={0.6}
            strokeDasharray="2 3"
            opacity={0.4}
          />
          <line
            x1={sunPoint.x}
            y1={sunPoint.y}
            x2={fx2}
            y2={fy2}
            stroke="#F0A31A"
            strokeWidth={0.6}
            strokeDasharray="2 3"
            opacity={0.4}
          />
        </g>
      )}

      {/* Sol actual con halo de respiración solar suave */}
      {showSun && sunPoint && (
        <g>
          <circle cx={sunPoint.x} cy={sunPoint.y} r={SUN_RADIUS + 4} fill="#F0A31A" opacity={0.25}>
            <animate
              attributeName="r"
              values={`${SUN_RADIUS + 2};${SUN_RADIUS + 7};${SUN_RADIUS + 2}`}
              dur="3.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.35;0.08;0.35"
              dur="3.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={sunPoint.x} cy={sunPoint.y} r={SUN_RADIUS} fill={CHART_COLORS.accent} />
          <text x={sunPoint.x + 9} y={sunPoint.y - 4} fill="#F0A31A" fontSize={8} fontWeight="bold">
            {sunText} ({now.sun.elevation.toFixed(0)}°)
          </text>
        </g>
      )}

      {/* ============================================================== */}
      {/* MECATRÓNICA DEL SEGUIDOR SOLAR                                 */}
      {/* ============================================================== */}

      {/* Base Anchor / Pedestal de Acero */}
      <polygon
        points="192,200 208,200 204,165 196,165"
        fill="#27272a"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
      />

      {/* Pivote del Motorreductor Mechatrónico */}
      <circle cx={pivotX} cy={pivotY} r={5.5} fill="#F0A31A" stroke="#000" strokeWidth={1.5} />

      {/* Dorso del Panel (Chasis Estructural / Marco de Acero) */}
      <line
        x1={bx1}
        y1={by1}
        x2={bx2}
        y2={by2}
        stroke="#1e293b"
        strokeWidth={8}
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
      />

      {/* Cara Activa Frontal (Celdas Fotovoltaicas Monocristalinas orientadas al Sol) */}
      <line
        x1={fx1}
        y1={fy1}
        x2={fx2}
        y2={fy2}
        stroke="#1e40af"
        strokeWidth={5}
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
      />
      {/* Vidrio reflectivo antirreflejo / Agua en autolavado */}
      <line
        x1={fx1}
        y1={fy1}
        x2={fx2}
        y2={fy2}
        stroke={mode === 'clean_panels_rainwash' ? '#38bdf8' : '#60a5fa'}
        strokeWidth={2.5}
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
      />

      {/* Vector Normal del Panel (n̂ perpendicular apuntando al Sol) */}
      <line
        x1={pivotX}
        y1={pivotY}
        x2={normalX}
        y2={normalY}
        stroke="#F0A31A"
        strokeWidth={1.4}
        strokeDasharray="3 2"
        markerEnd="url(#normalArrow)"
        className="transition-all duration-300 ease-out"
      />
      <text
        x={normalX + (nx >= 0 ? 5 : -22)}
        y={normalY - 3}
        fill="#F0A31A"
        fontSize={7.5}
        fontWeight="bold"
        className="transition-all duration-300 font-mono"
      >
        n̂
      </text>

      {/* Gotas de lluvia en modo autolavado */}
      {(mode === 'clean_panels_rainwash' || isRaining) && (
        <g stroke="#38bdf8" strokeWidth={1.5} strokeLinecap="round" opacity={0.8}>
          <line x1={x1 - 5} y1={y1 - 12} x2={x1} y2={y1 - 4} />
          <line x1={pivotX - 3} y1={pivotY - 18} x2={pivotX} y2={pivotY - 8} />
          <line x1={x2 - 2} y1={y2 - 14} x2={x2 + 2} y2={y2 - 6} />
          <text x={pivotX - 45} y={145} fill="#38bdf8" fontSize={8} fontWeight="bold">
            {rainwashText}
          </text>
        </g>
      )}

      {/* Badge de Telemetría Mecatrónica en el SVG */}
      <rect x={10} y={10} width={175} height={20} rx={4} fill="rgba(0,0,0,0.7)" stroke="rgba(255,255,255,0.15)" />
      <circle cx={20} cy={20} r={3} fill={mode === 'clean_panels_rainwash' ? '#38bdf8' : '#10b981'} className="animate-pulse" />
      <text x={28} y={23} fill="#e4e4e7" fontSize={8} fontWeight="bold">
        {mechatronicsPrefix}: {mode.toUpperCase()}
      </text>
    </svg>
  )
}
