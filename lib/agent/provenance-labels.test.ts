import { describe, expect, it } from 'vitest'
import { getBedrockProvenanceMessage, getDeciderProvenanceMessage } from './provenance-labels'
import type { DeciderDecision } from './decider-tool-selection'
import type { BedrockProspectingSummaryOutput } from './bedrock-financial-model'

const decision = (engine: DeciderDecision['engine'], fallbackReason?: DeciderDecision['fallbackReason']): DeciderDecision => ({
  choice: 'adjust_solar_tracker',
  confidence: 0.9,
  latencyMs: 12,
  engine,
  model: engine === 'strands-decider-2b' ? 'checkpoint-name' : null,
  whEstimated: null,
  fallbackReason,
  reasoning: 'decision explanation',
  timestamp: 1,
})

const deciderCopy = {
  sample: 'Sample decision',
  live: 'Remote decision',
  fallback: 'Local heuristic',
  fallbackReasons: {
    endpoint_not_configured: 'Endpoint missing',
    request_failed: 'Request failed',
    invalid_response: 'Response invalid',
  },
}

describe('provenance labels', () => {
  it('marks initial UI values as samples before a response arrives', () => {
    expect(getDeciderProvenanceMessage(decision('heuristic-fallback', 'endpoint_not_configured'), false, deciderCopy)).toBe('Sample decision')
  })

  it('distinguishes a validated remote decision from a local fallback and its reason', () => {
    expect(getDeciderProvenanceMessage(decision('strands-decider-2b'), true, deciderCopy)).toBe('Remote decision')
    expect(getDeciderProvenanceMessage(decision('heuristic-fallback', 'request_failed'), true, deciderCopy)).toBe('Local heuristic Request failed')
  })

  it('labels Bedrock summaries according to the engine that produced them', () => {
    const summary = (engine: BedrockProspectingSummaryOutput['engine']): BedrockProspectingSummaryOutput => ({
      executiveSummary: 'summary',
      keyHighlights: [],
      frugalAnalysis: '',
      engine,
      modelId: engine === 'amazon-bedrock' ? 'model-id' : null,
      fallbackReason: engine === 'local-fallback' ? 'disabled' : undefined,
      llmLatencyMs: 4,
      generatedAt: 1,
    })
    const copy = { live: 'Bedrock summary', fallback: 'Simulated local summary' }

    expect(getBedrockProvenanceMessage(summary('amazon-bedrock'), copy)).toBe('Bedrock summary')
    expect(getBedrockProvenanceMessage(summary('local-fallback'), copy)).toBe('Simulated local summary')
  })
})
