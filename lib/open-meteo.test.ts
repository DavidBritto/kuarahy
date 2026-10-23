import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLiveSolarTelemetry } from './open-meteo'

describe('Open-Meteo Live Solar Telemetry Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and parses live telemetry successfully when network is available', async () => {
    const mockPayload = {
      current: {
        temperature_2m: 23.5,
        wind_speed_10m: 14.2,
        precipitation: 0.0,
        cloud_cover: 15,
      },
      hourly: {
        temperature_2m: new Array(24).fill(22),
        wind_speed_10m: new Array(24).fill(12),
        precipitation: new Array(24).fill(0),
        cloud_cover: new Array(24).fill(10),
        global_tilted_irradiance: new Array(24).fill(720),
        direct_normal_irradiance: new Array(24).fill(610),
      },
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPayload,
    } as Response)

    const result = await fetchLiveSolarTelemetry(-31.42, -64.19)
    expect(result.isLive).toBe(true)
    expect(result.source).toContain('Open-Meteo')
    expect(result.current.temperatureC).toBe(23.5)
    expect(result.current.windSpeedKmh).toBe(14.2)
    expect(result.points).toHaveLength(16) // 5:00 to 20:00
    expect(result.points[0].ts).toBeDefined()
  })

  it('falls back gracefully to offline deterministic model if API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchLiveSolarTelemetry(-31.42, -64.19)
    expect(result.isLive).toBe(false)
    expect(result.source).toContain('Offline Fallback')
    expect(result.points).toHaveLength(16)
    expect(result.current.temperatureC).toBe(24)
  })
})
