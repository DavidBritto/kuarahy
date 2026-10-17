import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/prospect', () => {
  beforeEach(() => {
    vi.stubEnv('STRANDS_DECIDER_ENDPOINT', '')
    vi.stubEnv('BEDROCK_ENABLED', 'false')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('returns solar prospect analysis with an explicit local decision fallback when unconfigured', async () => {
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
    expect(data.decider.engine).toBe('heuristic-fallback')
    expect(data.decider.model).toBeNull()
    expect(data.decider.fallbackReason).toBe('endpoint_not_configured')
    expect(data.valuation.installedCapacityMwp).toBe(7.75) // 12.5 * 620 / 1000
    expect(data.valuation.annualGenerationMwh).toBeGreaterThan(12000)
    expect(data.bedrock.executiveSummary).toContain('12.5 hectáreas')
    expect(data.meta.frugalSavingsWh).toBeNull()
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
