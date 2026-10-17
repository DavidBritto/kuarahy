import { describe, it, expect } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/prospect', () => {
  it('returns complete solar prospect analysis with Decider 2B and Bedrock', async () => {
    const req = new NextRequest('http://localhost:3000/api/prospect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: -31.4201,
        lon: -64.1888,
        areaHa: 12.5,
        topology: 'single_axis_tracker',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.decider.choice).toBe('evaluate_solar_prospect')
    expect(data.decider.latencyMs).toBeLessThan(120)
    expect(data.valuation.installedCapacityMwp).toBe(7.75) // 12.5 * 620 / 1000
    expect(data.valuation.annualGenerationMwh).toBeGreaterThan(12000)
    expect(data.bedrock.executiveSummary).toContain('12.5 hectáreas')
    expect(data.meta.frugalSavingsWh).toBeGreaterThan(0.2)
  })

  it('rejects invalid area', async () => {
    const req = new NextRequest('http://localhost:3000/api/prospect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaHa: -2 }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('mayor a 0')
  })
})
