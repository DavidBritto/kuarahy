import { getPosition } from 'suncalc'
import type { HourlyPoint, SunPosition } from './types'

export interface OpenMeteoLiveTelemetry {
  isLive: boolean
  source: string
  fetchedAt: string
  coords: { lat: number; lon: number }
  current: {
    temperatureC: number
    windSpeedKmh: number
    precipitationMm: number
    cloudCoverPct: number
    gtiWm2: number
    elevationDeg: number
  }
  points: HourlyPoint[]
}

/**
 * Normalizes Open-Meteo API response combined with SunCalc solar geometry.
 */
export async function fetchLiveSolarTelemetry(
  lat: number = -31.42,
  lon: number = -64.19
): Promise<OpenMeteoLiveTelemetry> {
  const today = new Date()
  const fallbackPoints = buildFallbackDayTelemetry(lat, lon, today)

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m,direct_normal_irradiance,global_tilted_irradiance&timezone=auto&forecast_days=1`
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`)
    }

    const data = await res.json()
    const current = data.current || {}
    const hourly = data.hourly || {}

    const nowPos = getPosition(today, lat, lon)
    const nowElevation = nowPos.altitude

    // Map 5:00 to 20:00 (16 slots)
    const points: HourlyPoint[] = []

    for (let h = 5; h <= 20; h++) {
      const d = new Date(today)
      d.setHours(h, 0, 0, 0)
      const tsMs = d.getTime()

      const { altitude, azimuth } = getPosition(d, lat, lon)
      const elevation = altitude

      // Open-Meteo hourly index corresponds to hour h (0-23) in local timezone
      const gtiRaw = hourly.global_tilted_irradiance?.[h]
      const dniRaw = hourly.direct_normal_irradiance?.[h]
      const tempRaw = hourly.temperature_2m?.[h]
      const cloudRaw = hourly.cloud_cover?.[h]

      const ghiCalc = elevation > 0 ? Math.max(0, Math.sin((elevation * Math.PI) / 180)) * 950 : 0
      
      // When sun is above horizon, ensure GTI is physically realistic even under cloud edge
      const gti = typeof gtiRaw === 'number' && Number.isFinite(gtiRaw) && gtiRaw > 0
        ? gtiRaw
        : (elevation > 0 ? Math.max(35, Math.round(ghiCalc * 1.05)) : 0)

      const dni = typeof dniRaw === 'number' && Number.isFinite(dniRaw) && dniRaw > 0
        ? dniRaw
        : Math.round(gti * 0.82)

      const temperature = typeof tempRaw === 'number' ? tempRaw : 24
      const cloudCover = typeof cloudRaw === 'number' ? cloudRaw : 10

      const poa = gti
      const powerKw = (poa * 10 * 0.21 * 0.85) / 1000
      const powerOptimalKw = (poa * 10 * 0.21 * 0.85 * 1.248) / 1000

      points.push({
        ts: tsMs,
        sun: { ts: tsMs, elevation, azimuth },
        ghi: ghiCalc,
        dni,
        dhi: Math.max(0, gti - dni),
        poa,
        gtiApi: gti,
        cosIncidence: Math.max(0, Math.sin((Math.max(elevation, 0) * Math.PI) / 180)),
        cloudCover,
        temperature,
        powerKw,
        powerOptimalKw,
      })
    }

    // Determine current GTI from current hour or SunCalc
    const currentHour = today.getHours()
    const rawCurGti = hourly.global_tilted_irradiance?.[currentHour]
    const currentHourGti = typeof rawCurGti === 'number' && rawCurGti > 0
      ? rawCurGti
      : (nowElevation > 0 ? Math.round(Math.sin((nowElevation * Math.PI) / 180) * 980) : 0)

    return {
      isLive: true,
      source: 'Open-Meteo Solar API & SunCalc (Live)',
      fetchedAt: today.toISOString(),
      coords: { lat, lon },
      current: {
        temperatureC: Number(current.temperature_2m ?? 22),
        windSpeedKmh: Number(current.wind_speed_10m ?? 12),
        precipitationMm: Number(current.precipitation ?? 0),
        cloudCoverPct: Number(current.cloud_cover ?? 10),
        gtiWm2: Math.max(0, Math.round(currentHourGti)),
        elevationDeg: Number(nowElevation.toFixed(1)),
      },
      points,
    }
  } catch {
    const nowPos = getPosition(today, lat, lon)
    return {
      isLive: false,
      source: 'Deterministic Physical Model & SunCalc (Offline Fallback)',
      fetchedAt: today.toISOString(),
      coords: { lat, lon },
      current: {
        temperatureC: 24,
        windSpeedKmh: 12,
        precipitationMm: 0,
        cloudCoverPct: 8,
        gtiWm2: nowPos.altitude > 0 ? Math.round(Math.sin((nowPos.altitude * Math.PI) / 180) * 950) : 0,
        elevationDeg: Number(nowPos.altitude.toFixed(1)),
      },
      points: fallbackPoints,
    }
  }
}

function buildFallbackDayTelemetry(lat: number, lon: number, today: Date): HourlyPoint[] {
  const points: HourlyPoint[] = []

  for (let h = 5; h <= 20; h++) {
    const d = new Date(today)
    d.setHours(h, 0, 0, 0)
    const tsMs = d.getTime()
    const { altitude, azimuth } = getPosition(d, lat, lon)
    const elevation = altitude
    const ghi = elevation > 0 ? Math.max(0, Math.sin((elevation * Math.PI) / 180)) * 950 : 0
    const poa = ghi * 1.05

    points.push({
      ts: tsMs,
      sun: { ts: tsMs, elevation, azimuth },
      ghi,
      dni: ghi * 0.85,
      dhi: ghi * 0.15,
      poa,
      gtiApi: poa,
      cosIncidence: Math.max(0, Math.sin((Math.max(elevation, 0) * Math.PI) / 180)),
      cloudCover: 5,
      temperature: 24,
      powerKw: (poa * 10 * 0.21 * 0.85) / 1000,
      powerOptimalKw: (poa * 10 * 0.21 * 0.85 * 1.248) / 1000,
    })
  }
  return points
}
