import { describe, it, expect } from 'vitest'
import {
  DeciderToolSelector,
  SolariaSolarDecider,
  type SolariaAgentState,
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

  it('uses an explicitly labeled local fallback when no endpoint is configured', async () => {
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
    expect(result.whEstimated).toBeNull()
    expect(result.engine).toBe('heuristic-fallback')
    expect(result.fallbackReason).toBe('endpoint_not_configured')
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('sends the upstream typed-choice request and trusts only a valid attributed response', async () => {
    let sentBody: Record<string, unknown> | undefined
    const selector = new DeciderToolSelector({
      question: 'Select the safest action.',
      model: 'strands-decider-2b',
      endpointUrl: 'https://decider.invalid/v1/systemone',
      options: [
        { id: 'tool_a', label: 'A', description: 'First option', whenToUse: 'When A' },
        { id: 'tool_b', label: 'B', description: 'Second option', whenToUse: 'When B' },
      ],
      extractState: (state: { value: number }) => ({ value: state.value }),
      fetcher: async (_input, init) => {
        sentBody = JSON.parse(String(init?.body))
        return Response.json({
          model: 'strands-decider-2b',
          answers: { tool_selection: { type: 'choice', choice: 'tool_b', probabilities: { tool_a: 0.1, tool_b: 0.9 }, confidence: 0.9 } },
          usage: {},
          latency_ms: 12,
        })
      },
    })

    const result = await selector.evaluate({ value: 42 })
    expect(sentBody).toEqual({
      state: { value: 42 },
      model: 'strands-decider-2b',
      questions: { tool_selection: { type: 'choice', instructions: 'Select the safest action.', criteria: { tool_a: 'First option', tool_b: 'Second option' } } },
    })
    expect(result).toMatchObject({ choice: 'tool_b', confidence: 0.9, engine: 'strands-decider-2b', model: 'strands-decider-2b', whEstimated: null })
    expect(result.reasoning).toContain('strands-decider-2b')
  })

  it.each([
    ['HTTP failure', async () => new Response('unavailable', { status: 503 }), 'request_failed'],
    ['malformed response', async () => Response.json({ model: 'strands-decider-2b' }), 'invalid_response'],
    ['unknown choice', async () => Response.json({ model: 'strands-decider-2b', answers: { tool_selection: { type: 'choice', choice: 'outside_options', confidence: 0.9 } } }), 'invalid_response'],
    ['incorrect model attribution', async () => Response.json({ model: 'some-other-model', answers: { tool_selection: { type: 'choice', choice: 'tool_a', confidence: 0.9 } } }), 'invalid_response'],
    ['invalid confidence', async () => Response.json({ model: 'strands-decider-2b', answers: { tool_selection: { type: 'choice', choice: 'tool_a', confidence: Infinity } } }), 'invalid_response'],
  ] as const)('falls back on %s', async (_label, responder, fallbackReason) => {
    const selector = new DeciderToolSelector({
      question: 'Choose', endpointUrl: 'https://decider.invalid/v1/systemone',
      options: [{ id: 'tool_a', label: 'A', description: 'A', whenToUse: 'Always' }],
      extractState: () => ({}), fetcher: async () => responder(),
    })
    const result = await selector.evaluate({})
    expect(result.engine).toBe('heuristic-fallback')
    expect(result.fallbackReason).toBe(fallbackReason)
    expect(result.whEstimated).toBeNull()
  })

  it('falls back when the configured request times out', async () => {
    const selector = new DeciderToolSelector({
      question: 'Choose', endpointUrl: 'https://decider.invalid/v1/systemone', timeoutMs: 5,
      options: [{ id: 'tool_a', label: 'A', description: 'A', whenToUse: 'Always' }],
      extractState: () => ({}),
      fetcher: (_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('request timed out')))
      }),
    })
    const result = await selector.evaluate({})
    expect(result.engine).toBe('heuristic-fallback')
    expect(result.fallbackReason).toBe('request_failed')
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
    expect(intervention.frugalSavingsWh).toBeNull()
  })
})

describe('SolariaSolarDecider — Domain Decision Matrix', () => {
  const decider = new SolariaSolarDecider()

  it('triggers storm_safeguard on dangerous wind speeds (Priority 1)', async () => {
    const state: SolariaAgentState = {
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
    const state: SolariaAgentState = {
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
    const state: SolariaAgentState = {
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
    const state: SolariaAgentState = {
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
    const state: SolariaAgentState = {
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
    const state: SolariaAgentState = {
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
    const state: SolariaAgentState = {
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
