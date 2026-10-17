import { describe, it, expect } from 'vitest'
import {
  DeciderToolSelector,
  KuarahySolarDecider,
  FRUGAL_METRICS,
  type KuarahyAgentState,
} from './decider-tool-selection'

describe('AWS Strands Decider 2B — #tool-selection Pattern', () => {
  it('throws an error if instantiated with no options', () => {
    expect(() => {
      new DeciderToolSelector({
        question: 'Which tool?',
        options: [],
        extractState: () => ({}),
      })
    }).toThrow('DeciderToolSelector requires at least one tool option.')
  })

  it('evaluates generic options and outputs calibrated confidence and frugal metrics', async () => {
    const selector = new DeciderToolSelector({
      question: 'Test question',
      options: [
        { id: 'tool_a', label: 'Tool A', description: 'Desc A', whenToUse: 'Always' },
        { id: 'tool_b', label: 'Tool B', description: 'Desc B', whenToUse: 'Never' },
      ],
      extractState: (state: { value: number }) => ({ value: state.value }),
    })

    const result = await selector.evaluate({ value: 42 })

    expect(result.choice).toBe('tool_a')
    expect(result.confidence).toBeGreaterThan(0.5)
    expect(result.whEstimated).toBe(FRUGAL_METRICS.DECIDER_2B_WH_PER_CALL)
    expect(result.engine).toBe('strands-decider-2b')
    expect(result.latencyMs).toBeLessThan(100) // Fast deterministic execution
  })

  it('exports an AWS Strands compatible intervention handler', async () => {
    const selector = new DeciderToolSelector({
      question: 'Test',
      options: [{ id: 'action_1', label: '1', description: 'desc', whenToUse: 'now' }],
      extractState: () => ({}),
    })

    const handler = selector.asStrandsInterventionHandler()
    expect(handler.pattern).toBe('#tool-selection')

    const intervention = await handler.handle({ state: {} })
    expect(intervention.intervene).toBe(true)
    expect(intervention.selectedTool).toBe('action_1')
    expect(intervention.frugalSavingsWh).toBeGreaterThan(0.2) // Saved > 0.2 Wh vs 70B LLM
  })
})

describe('KuarahySolarDecider — Domain Decision Matrix', () => {
  const decider = new KuarahySolarDecider()

  it('triggers storm_safeguard on dangerous wind speeds (Priority 1)', async () => {
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat: -25.2637, lon: -57.5759 }, // Asunción
      windSpeedKmh: 68,
      gti: 800,
      elevation: 45,
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('storm_safeguard')
    expect(decision.confidence).toBeGreaterThanOrEqual(0.99)
    expect(decision.reasoning).toContain('Critical wind speed')
  })

  it('triggers clean_panels_rainwash on rainfall with accumulated dust (Mechatronics Wash)', async () => {
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat: -27.47, lon: -58.83 }, // Corrientes
      precipitationMm: 3.5, // Active rain
      soilingLossPct: 8.2,  // Significant dust accumulation
      windSpeedKmh: 18,
      gti: 350,
      elevation: 40,
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('clean_panels_rainwash')
    expect(decision.confidence).toBeGreaterThanOrEqual(0.95)
    expect(decision.reasoning).toContain('Lluvia activa')
    expect(decision.reasoning).toContain('65°')
  })

  it('triggers evaluate_solar_prospect when in prospecting mode with parcel area (Priority 2)', async () => {
    const state: KuarahyAgentState = {
      mode: 'prospecting',
      coords: { lat: -31.4201, lon: -64.1888 }, // Córdoba
      areaHa: 25.5,
      windSpeedKmh: 15,
      gti: 750,
      elevation: 50,
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('evaluate_solar_prospect')
    expect(decision.confidence).toBeGreaterThanOrEqual(0.95)
    expect(decision.reasoning).toContain('25.5 ha parcel')
  })

  it('triggers standby_idle at night with normal tariff', async () => {
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat: -34.6037, lon: -58.3816 }, // Buenos Aires
      elevation: -15, // Night
      gti: 0,
      tariffPriceUsdPerKwh: 0.08,
      batterySocPct: 50,
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('standby_idle')
    expect(decision.confidence).toBeGreaterThanOrEqual(0.95)
    expect(decision.reasoning).toContain('Sun below horizon')
  })

  it('triggers battery_arbitrage at night during peak tariff window if battery has charge', async () => {
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat: -34.6037, lon: -58.3816 },
      elevation: -5,
      gti: 0,
      tariffPriceUsdPerKwh: 0.28, // Peak tariff window
      batterySocPct: 75,
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('battery_arbitrage')
    expect(decision.reasoning).toContain('Night peak tariff')
  })

  it('triggers battery_arbitrage during peak midday solar generation', async () => {
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat: -25.2637, lon: -57.5759 },
      elevation: 65,
      gti: 850,
      batterySocPct: 40,
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('battery_arbitrage')
    expect(decision.reasoning).toContain('High irradiance')
  })

  it('triggers adjust_solar_tracker during normal active generation', async () => {
    const state: KuarahyAgentState = {
      mode: 'telemetry_tracking',
      coords: { lat: -25.2637, lon: -57.5759 },
      elevation: 30,
      gti: 350,
      batterySocPct: 95, // Battery full, focus on tracking
    }

    const decision = await decider.evaluate(state)
    expect(decision.choice).toBe('adjust_solar_tracker')
    expect(decision.reasoning).toContain('Daylight generation active')
  })
})
