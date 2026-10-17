/**
 * AWS Strands Decider 2B — Reusable Decision Pattern: #tool-selection
 * 
 * Hackathon tags: #strands-decider-2b #tool-selection
 * Architecture Thesis: Built under Werner Vogels' "The Frugal Architect" principles.
 * 
 * The configured Strands Decider endpoint evaluates a typed state and question;
 * without a valid response, this module labels its local heuristic fallback explicitly.
 * 
 * This module exports:
 * 1. A generic, reusable `DeciderToolSelector<TState, TToolName>` class usable in any agent.
 * 2. An AWS Strands-compatible `InterventionHandler` adapter.
 * 3. Specific pre-configured tools and evaluation logic for Kuarahy Solar AX.
 * 4. Local solar-domain heuristic evaluation for offline use.
 */

export interface DeciderToolOption<TToolName extends string = string> {
  id: TToolName
  label: string
  description: string
  whenToUse: string
  payloadSchema?: Record<string, string>
}

export interface DeciderDecision<TToolName extends string = string> {
  choice: TToolName
  confidence: number // Remote confidence or a local heuristic score, in the 0.0–1.0 range.
  latencyMs: number
  engine: 'strands-decider-2b' | 'heuristic-fallback' | 'bedrock-llm'
  model: string | null
  whEstimated: number | null // No energy estimate is available for this invocation.
  reasoning: string
  fallbackReason?: 'endpoint_not_configured' | 'request_failed' | 'invalid_response'
  timestamp: number
}

export interface DeciderToolSelectionConfig<TState, TToolName extends string> {
  question: string
  options: DeciderToolOption<TToolName>[]
  extractState: (state: TState) => Record<string, unknown>
  endpointUrl?: string
  model?: string
  timeoutMs?: number
  fetcher?: typeof fetch
  confidenceThreshold?: number // Default: 0.65
}

/**
 * Reusable Decider 2B Tool Selector
 */
export class DeciderToolSelector<TState, TToolName extends string> {
  private config: DeciderToolSelectionConfig<TState, TToolName>

  constructor(config: DeciderToolSelectionConfig<TState, TToolName>) {
    if (!config.options || config.options.length === 0) {
      throw new Error('DeciderToolSelector requires at least one tool option.')
    }
    this.config = {
      confidenceThreshold: 0.65,
      ...config,
    }
  }

  /**
   * Evaluates the state using the typed Strands Decider HTTP API when configured.
   * If unavailable or invalid, returns a clearly identified local heuristic result.
   */
  async evaluate(state: TState): Promise<DeciderDecision<TToolName>> {
    const startTime = performance.now()
    const serializedState = this.config.extractState(state)

    let fallbackReason: DeciderDecision<TToolName>['fallbackReason'] = 'endpoint_not_configured'
    if (this.config.endpointUrl) {
      try {
        const response = await (this.config.fetcher ?? fetch)(this.config.endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          signal: AbortSignal.timeout(this.config.timeoutMs ?? 1500),
          body: JSON.stringify({
            state: serializedState,
            model: this.config.model ?? 'strands-decider-2b',
            questions: {
              tool_selection: {
                type: 'choice',
                instructions: this.config.question,
                criteria: Object.fromEntries(this.config.options.map(option => [option.id, option.description])),
              },
            },
          }),
        })

        if (!response.ok) {
          fallbackReason = 'request_failed'
        } else {
          const data: unknown = await response.json()
          const remote = parseDeciderResponse<TToolName>(data, this.config.options.map(option => option.id), this.config.model ?? 'strands-decider-2b')
          if (!remote) {
            fallbackReason = 'invalid_response'
          } else {
            const latencyMs = Math.round(performance.now() - startTime)
            return {
              choice: remote.choice,
              confidence: remote.confidence,
              latencyMs,
              engine: 'strands-decider-2b',
              model: remote.model,
              whEstimated: null,
              reasoning: `Strands Decider (${remote.model}) selected ${remote.choice}`,
              timestamp: Date.now(),
            }
          }
        }
      } catch {
        fallbackReason = 'request_failed'
      }
    }

    // Local heuristic decision; do not attribute it to the remote model.
    const fallback = this.heuristicEvaluate(serializedState)
    const latencyMs = Math.round(performance.now() - startTime)

    return {
      choice: fallback.choice,
      confidence: fallback.confidence,
      latencyMs,
      engine: 'heuristic-fallback',
      model: null,
      whEstimated: null,
      reasoning: fallback.reasoning,
      fallbackReason,
      timestamp: Date.now(),
    }
  }

  /**
   * Deterministic edge evaluator mimicking Decider 2B's scoring matrix.
   */
  protected heuristicEvaluate(_state: Record<string, unknown>): {
    choice: TToolName
    confidence: number
    reasoning: string
  } {
    void _state
    // Default fallback to first option
    return {
      choice: this.config.options[0].id,
      confidence: 0.85,
      reasoning: `Local heuristic selected the primary tool: ${this.config.options[0].id}`,
    }
  }

  /**
   * AWS Strands Intervention Handler Adapter.
   * Can be directly plugged into AWS Strands agent execution pipelines.
   */
  asStrandsInterventionHandler() {
    return {
      name: 'strands-decider-tool-selection',
      pattern: '#tool-selection',
      handle: async (agentContext: { state: TState; intent?: string }) => {
        const decision = await this.evaluate(agentContext.state)
        return {
          intervene: true,
          selectedTool: decision.choice,
          confidence: decision.confidence,
          latencyMs: decision.latencyMs,
          engine: decision.engine,
          frugalSavingsWh: null,
        }
      },
    }
  }
}

function parseDeciderResponse<TToolName extends string>(
  value: unknown,
  allowedChoices: readonly TToolName[],
  requestedModel: string,
): { choice: TToolName; confidence: number; model: string } | null {
  if (!value || typeof value !== 'object') return null
  const response = value as Record<string, unknown>
  if (typeof response.model !== 'string' || response.model.trim() !== requestedModel) return null
  if (!response.answers || typeof response.answers !== 'object') return null
  const answers = response.answers as Record<string, unknown>
  if (!answers.tool_selection || typeof answers.tool_selection !== 'object') return null
  const answer = answers.tool_selection as Record<string, unknown>
  const confidence = answer.confidence
  if (answer.type !== 'choice' || typeof answer.choice !== 'string' ||
      !allowedChoices.includes(answer.choice as TToolName) ||
      typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) return null
  return { choice: answer.choice as TToolName, confidence, model: response.model }
}

// ============================================================================
// KUARAHY SOLAR AX — SPECIFIC IMPLEMENTATION
// ============================================================================

export type KuarahyToolAction =
  | 'evaluate_solar_prospect'    // Land parcel prospecting & investment valuation
  | 'adjust_solar_tracker'       // High-frequency dual/single-axis motor tracking
  | 'clean_panels_rainwash'      // Steep tilt rainwash self-cleaning mechatronics
  | 'battery_arbitrage'          // Battery charge/discharge/grid peak injection
  | 'storm_safeguard'            // Stow panels to horizontal defense mode
  | 'standby_idle'               // Night or no irradiance change

export interface KuarahyAgentState {
  mode: 'prospecting' | 'telemetry_tracking'
  coords: { lat: number; lon: number }
  areaHa?: number                // Hectares for land prospecting
  elevation?: number             // Sun elevation in degrees (-90 to +90)
  gti?: number                   // Global Tilted Irradiance in W/m²
  ghi?: number
  windSpeedKmh?: number          // For storm safety
  precipitationMm?: number       // Rainfall in mm/h for washing decision
  soilingLossPct?: number        // Dust / particulate soiling loss (0 - 25%)
  batterySocPct?: number         // Battery state of charge (0 - 100)
  tariffPriceUsdPerKwh?: number  // Real-time spot price
  cloudCoverPct?: number
}

export const KUARAHY_DECIDER_TOOLS: DeciderToolOption<KuarahyToolAction>[] = [
  {
    id: 'evaluate_solar_prospect',
    label: 'Solar Field Prospecting & Yield Analysis',
    description: 'Calculates MWh generation, CapEx, and multi-year ROI for selected land hectares.',
    whenToUse: 'When in prospecting mode with parcel coordinates and hectare area defined.',
  },
  {
    id: 'storm_safeguard',
    label: 'Storm & High-Wind Safeguard Stow',
    description: 'Flattens solar trackers to 0° tilt to prevent structural damage.',
    whenToUse: 'When wind speed exceeds safety threshold (> 60 km/h) or hail alert is active.',
  },
  {
    id: 'clean_panels_rainwash',
    label: 'Rainfall Self-Cleaning Mechatronic Wash',
    description: 'Tilts panels to steep angle (65°-75°) to wash away accumulated dust using rainfall.',
    whenToUse: 'When rain is detected (> 1.5mm/h) and panel soiling loss exceeds threshold (> 4%).',
  },
  {
    id: 'adjust_solar_tracker',
    label: 'Dynamic Solar Tracker Actuation',
    description: 'Actuates tracker motors to optimal azimuth and elevation tilt to maximize GTI.',
    whenToUse: 'When sun elevation > 0° and solar irradiance delta GTI is significant (> 15 W/m²).',
  },
  {
    id: 'battery_arbitrage',
    label: 'Battery Microgrid Arbitrage Dispatch',
    description: 'Optimizes battery charge from solar vs discharge to load/grid based on spot tariffs.',
    whenToUse: 'When generation exceeds load and grid spot tariff is in peak pricing band.',
  },
  {
    id: 'standby_idle',
    label: 'Standby / Low Energy Idle',
    description: 'Keeps actuator circuits in ultra-low power standby.',
    whenToUse: 'At night (sun elevation <= 0) or during steady diffuse irradiance.',
  },
]

export class KuarahySolarDecider extends DeciderToolSelector<KuarahyAgentState, KuarahyToolAction> {
  constructor(endpointUrl?: string, model?: string) {
    super({
      question: 'Given the real-time solar telemetry and operating mode, select the optimal actuation or assessment tool.',
      options: KUARAHY_DECIDER_TOOLS,
      endpointUrl,
      model,
      extractState: (state: KuarahyAgentState) => ({
        mode: state.mode,
        lat: state.coords.lat,
        lon: state.coords.lon,
        areaHa: state.areaHa ?? 0,
        elevation: state.elevation ?? 0,
        gti: state.gti ?? 0,
        windSpeedKmh: state.windSpeedKmh ?? 0,
        precipitationMm: state.precipitationMm ?? 0,
        soilingLossPct: state.soilingLossPct ?? 0,
        batterySocPct: state.batterySocPct ?? 50,
        tariffPriceUsdPerKwh: state.tariffPriceUsdPerKwh ?? 0.12,
        cloudCoverPct: state.cloudCoverPct ?? 0,
      }),
    })
  }

  /**
   * Specialized decision logic for Kuarahy Solar AX.
   */
  protected override heuristicEvaluate(state: Record<string, unknown>): {
    choice: KuarahyToolAction
    confidence: number
    reasoning: string
  } {
    const mode = state.mode as string
    const windSpeedKmh = Number(state.windSpeedKmh ?? 0)
    const elevation = Number(state.elevation ?? 0)
    const gti = Number(state.gti ?? 0)
    const batterySocPct = Number(state.batterySocPct ?? 50)
    const tariff = Number(state.tariffPriceUsdPerKwh ?? 0.12)
    const areaHa = Number(state.areaHa ?? 0)
    const precipitationMm = Number(state.precipitationMm ?? 0)
    const soilingLossPct = Number(state.soilingLossPct ?? 0)

    // Priority 1: Safety Stow (Storm Safeguard)
    if (windSpeedKmh >= 60) {
      return {
        choice: 'storm_safeguard',
        confidence: 0.99,
        reasoning: `Critical wind speed (${windSpeedKmh} km/h >= 60 km/h). Immediate structural defense stow required.`,
      }
    }

    // Priority 2: Rainfall Self-Cleaning Wash (Mechatronics)
    if (precipitationMm >= 1.5 && soilingLossPct >= 4) {
      return {
        choice: 'clean_panels_rainwash',
        confidence: 0.97,
        reasoning: `Lluvia activa (${precipitationMm.toFixed(1)} mm/h) con ${soilingLossPct.toFixed(1)}% de suciedad acumulada. Mecatrónica actuando: inclinación forzada a 65° para autolavado por escorrentía natural.`,
      }
    }

    // Priority 2: Prospecting Mode (Parcel Feasibility)
    if (mode === 'prospecting' && areaHa > 0) {
      return {
        choice: 'evaluate_solar_prospect',
        confidence: 0.96,
        reasoning: `Prospecting mode active for ${areaHa} ha parcel. Dispatching yield and financial ROI modeling.`,
      }
    }

    // Priority 3: Night / Below Horizon
    if (elevation <= 0) {
      // If peak tariff at night and battery has charge -> arbitrage discharge
      if (tariff >= 0.22 && batterySocPct > 30) {
        return {
          choice: 'battery_arbitrage',
          confidence: 0.91,
          reasoning: `Night peak tariff ($${tariff}/kWh) with battery SOC at ${batterySocPct}%. Discharging stored solar energy to grid.`,
        }
      }
      return {
        choice: 'standby_idle',
        confidence: 0.98,
        reasoning: `Sun below horizon (elevation ${elevation.toFixed(1)}°). Maintaining low-power night standby.`,
      }
    }

    // Priority 4: Active Solar Generation & Battery Arbitrage
    if (gti > 650 && batterySocPct < 90) {
      return {
        choice: 'battery_arbitrage',
        confidence: 0.92,
        reasoning: `High irradiance (${gti.toFixed(0)} W/m²) with battery capacity available (${batterySocPct}% SOC). Dispatching solar charge absorption.`,
      }
    }

    // Priority 5: Tracker Tracking
    if (gti > 150) {
      return {
        choice: 'adjust_solar_tracker',
        confidence: 0.94,
        reasoning: `Daylight generation active (elevation ${elevation.toFixed(1)}°, GTI ${gti.toFixed(0)} W/m²). Actuating dual-axis tracker motors.`,
      }
    }

    return {
      choice: 'standby_idle',
      confidence: 0.88,
      reasoning: 'Low irradiance conditions; holding current orientation to preserve motor actuation power.',
    }
  }
}
