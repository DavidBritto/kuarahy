import { NextRequest, NextResponse } from 'next/server'
import { KuarahySolarDecider, type KuarahyAgentState, type KuarahyToolAction } from '@/lib/agent/decider-tool-selection'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const elevation = Number(body.elevation ?? 35)
    const gti = Number(body.gti ?? 650)
    const windSpeedKmh = Number(body.windSpeedKmh ?? 12)
    const precipitationMm = Number(body.precipitationMm ?? 0)
    const soilingLossPct = Number(body.soilingLossPct ?? 0)
    const batterySocPct = Number(body.batterySocPct ?? 65)
    const tariffPriceUsdPerKwh = Number(body.tariffPriceUsdPerKwh ?? 0.12)
    const lat = Number(body.lat ?? -27.47)
    const lon = Number(body.lon ?? -58.83)

    const decider = new KuarahySolarDecider()
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat, lon },
      elevation,
      gti,
      windSpeedKmh,
      precipitationMm,
      soilingLossPct,
      batterySocPct,
      tariffPriceUsdPerKwh,
    }

    const decision = await decider.evaluate(state)

    // Calculate mechatronic actuation response
    let motorTiltDeg = 25
    let mechatronicStatus = 'TRACKING'

    if (decision.choice === 'storm_safeguard') {
      motorTiltDeg = 0
      mechatronicStatus = 'STOW_DEFENSE'
    } else if (decision.choice === 'clean_panels_rainwash') {
      motorTiltDeg = 65 // Steep runoff wash angle
      mechatronicStatus = 'RAIN_WASH'
    } else if (decision.choice === 'adjust_solar_tracker') {
      // Dynamic tilt: optimal normal vector to sun elevation
      motorTiltDeg = elevation > 0 ? Math.max(10, Math.min(60, 90 - elevation)) : 0
      mechatronicStatus = 'ACTIVE_TRACKING'
    } else if (decision.choice === 'battery_arbitrage') {
      motorTiltDeg = elevation > 0 ? Math.max(10, Math.min(60, 90 - elevation)) : 0
      mechatronicStatus = 'ARBITRAGE_DISPATCH'
    } else {
      motorTiltDeg = 0
      mechatronicStatus = 'STANDBY'
    }

    // Baseline comparison: Tracker vs Fixed-Tilt Panel
    const trackingMultiplier = decision.choice === 'adjust_solar_tracker' || decision.choice === 'battery_arbitrage' ? 1.248 : 1.0
    const fixedPowerKw = Number(((gti * 10 * 0.21 * 0.85) / 1000).toFixed(2)) // 10kWp standard array
    const trackingPowerKw = Number((fixedPowerKw * trackingMultiplier).toFixed(2))
    const gainPct = Number(((trackingMultiplier - 1.0) * 100).toFixed(1))

    return NextResponse.json({
      success: true,
      decision,
      mechatronics: {
        status: mechatronicStatus,
        motorTiltDeg,
        gainPct,
        trackingPowerKw,
        fixedPowerKw,
        powerDeltaKw: Number((trackingPowerKw - fixedPowerKw).toFixed(2)),
        isRaining: precipitationMm > 1.5,
        cleaningSavingsYearUsd: soilingLossPct > 4 && precipitationMm > 1.5 ? 1850 : 0,
      },
      meta: {
        latencyMs: decision.latencyMs,
        frugalSavingsWh: 0.24 - decision.whEstimated,
        timestamp: Date.now(),
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar la actuación mecatrónica'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
