/**
 * app/preview-david/page.tsx
 *
 * Ruta de previsualización AISLADA del carril de David, solo para ver
 * SolarArc / ValidationChart / PowerChart en el navegador mientras
 * lib/mock.ts (carril Lautaro) todavía no existe.
 *
 * No es parte del dashboard final: no toca app/page.tsx ni lib/mock.ts
 * (archivos exclusivos de otros carriles). Se puede borrar cuando el
 * dashboard real esté integrado.
 */

import { getPosition } from 'suncalc'

import SolarArc from '@/components/SolarArc'
import type { HourlyPoint, PanelConfig } from '@/lib/types'

const CORRIENTES = { lat: -27.47, lon: -58.83, label: 'Corrientes' }

// Panel instalado a modo de ejemplo: 20° al este del norte franco, tilt 20°.
const PANEL: PanelConfig = {
  azimuth: 20,
  tilt: 20,
  areaM2: 1.8,
  efficiency: 0.2,
  performanceRatio: 0.85,
}

const D2R = Math.PI / 180

// NOTA IMPORTANTE (ver handoff.md): la librería `suncalc` instalada por npm es la v2.0.1,
// que YA devuelve { azimuth, altitude } en GRADOS y en convención brújula norte
// (0=N, 90=E, 180=S, 270=O) — ver node_modules/suncalc/index.d.ts. Esto es distinto de la
// API v1.x que asume el §1 del Plan.md (radianes, medido desde el sur). Con la v2 instalada,
// `suncalcToCompass` del Plan NO debe aplicarse: haría una doble conversión y correría el
// azimut 180°. Este archivo usa la salida de la v2 tal cual, sin conversión adicional.
// Avisar a Cain antes de escribir lib/solar.ts con la fórmula del Plan tal cual está escrita.

/** Genera ~14 puntos horarios plausibles para un día fijo, con posición solar real (SunCalc v2). */
function buildPreviewPoints(baseDate: Date): HourlyPoint[] {
  const points: HourlyPoint[] = []
  for (let h = 5; h <= 19; h++) {
    const ts = new Date(baseDate)
    ts.setUTCHours(h, 0, 0, 0)
    const tsMs = ts.getTime()
    const { altitude, azimuth } = getPosition(new Date(tsMs), CORRIENTES.lat, CORRIENTES.lon)
    const elevation = altitude // ya en grados (SunCalc v2)
    const ghi = elevation > 0 ? Math.max(0, Math.sin(elevation * D2R)) * 900 : 0
    const dni = ghi * 0.8
    const dhi = ghi * 0.2
    const poa = ghi * 0.95
    points.push({
      ts: tsMs,
      sun: { ts: tsMs, elevation, azimuth }, // azimuth ya en convención brújula (SunCalc v2)
      ghi,
      dni,
      dhi,
      poa,
      gtiApi: poa * (0.97 + Math.random() * 0.06),
      cosIncidence: Math.max(0, Math.min(1, Math.sin(Math.max(elevation, 0) * D2R))),
      cloudCover: 10,
      temperature: 22 + Math.sin((h - 5) / 14 * Math.PI) * 8,
      powerKw: (poa * PANEL.areaM2 * PANEL.efficiency * PANEL.performanceRatio) / 1000,
      powerOptimalKw: (poa * PANEL.areaM2 * PANEL.efficiency * PANEL.performanceRatio * 1.12) / 1000,
    })
  }
  return points
}

export default function PreviewDavidPage() {
  // 2026-06-21T15:55Z — mediodía solar del solsticio de invierno en Corrientes.
  // Prueba de humo de §1 del Plan: elevación ≈ 39°, azimut ≈ 0° (norte).
  const baseDate = new Date('2026-06-21T12:00:00Z')
  const points = buildPreviewPoints(baseDate)

  const smokeTestTs = Date.parse('2026-06-21T15:55:00Z')
  const nowIndex = points.reduce(
    (closest, p, i) => (Math.abs(p.ts - smokeTestTs) < Math.abs(points[closest].ts - smokeTestTs) ? i : closest),
    0
  )
  const now = points[nowIndex]

  return (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '2rem', fontFamily: "'Roboto Mono', monospace", color: '#fff' }}>
      <h1 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', opacity: 0.7 }}>
        preview aislado — carril david — no forma parte del dashboard final
      </h1>
      <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', opacity: 0.5 }}>
        prueba de humo §1: elevación ≈ {now.sun.elevation.toFixed(1)}° · azimut ≈ {now.sun.azimuth.toFixed(1)}° (esperado ≈ 39.0 / 0.0)
      </p>

      <div style={{ maxWidth: 480 }}>
        <SolarArc points={points} now={now} panel={PANEL} />
      </div>
    </div>
  )
}
