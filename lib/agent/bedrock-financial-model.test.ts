import { describe, it, expect } from 'vitest'
import { generateBedrockProspectingSummary } from './bedrock-financial-model'
import { calculateSolarValuation } from '../solar-valuation'

describe('Amazon Bedrock Financial Model Synthesis', () => {
  it('generates executive financial proposal and respects Frugal Architect metrics', async () => {
    const valuation = calculateSolarValuation({
      coords: { lat: -31.4201, lon: -64.1888 },
      areaHa: 15,
      topology: 'single_axis_tracker',
    })

    const summary = await generateBedrockProspectingSummary({
      metrics: valuation,
      coords: { lat: -31.4201, lon: -64.1888 },
      deciderLatencyMs: 84,
    })

    expect(summary.executiveSummary).toContain('15.0 hectáreas')
    expect(summary.executiveSummary).toContain('CapEx')
    expect(summary.keyHighlights.length).toBe(3)
    expect(summary.frugalAnalysis).toContain('The Frugal Architect')
    expect(summary.frugalAnalysis).toContain('Strands Decider 2B')
    expect(summary.modelId).toBeDefined()
    expect(summary.llmLatencyMs).toBeGreaterThan(0)
  })
})
