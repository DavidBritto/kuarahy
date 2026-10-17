import { describe, it, expect } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/mechatronics/actuate', () => {
  it('triggers active tracking actuation with +24.8% power gain over fixed panel', async () => {
    const req = new NextRequest('http://localhost:3000/api/mechatronics/actuate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elevation: 45,
        gti: 800,
        windSpeedKmh: 12,
        batterySocPct: 90,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.decision.choice).toBe('adjust_solar_tracker')
    expect(data.mechatronics.status).toBe('ACTIVE_TRACKING')
    expect(data.mechatronics.gainPct).toBe(24.8)
    expect(data.mechatronics.trackingPowerKw).toBeGreaterThan(data.mechatronics.fixedPowerKw)
  })

  it('triggers rain wash mechatronic angle (65°) when rain and dust are present', async () => {
    const req = new NextRequest('http://localhost:3000/api/mechatronics/actuate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        precipitationMm: 4.0,
        soilingLossPct: 9.0,
        elevation: 30,
        windSpeedKmh: 15,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.decision.choice).toBe('clean_panels_rainwash')
    expect(data.mechatronics.status).toBe('RAIN_WASH')
    expect(data.mechatronics.motorTiltDeg).toBe(65)
    expect(data.mechatronics.cleaningSavingsYearUsd).toBe(1850)
  })

  it('triggers storm safeguard 0° flat stow on dangerous winds', async () => {
    const req = new NextRequest('http://localhost:3000/api/mechatronics/actuate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        windSpeedKmh: 75,
        elevation: 45,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.decision.choice).toBe('storm_safeguard')
    expect(data.mechatronics.status).toBe('STOW_DEFENSE')
    expect(data.mechatronics.motorTiltDeg).toBe(0)
  })
})
