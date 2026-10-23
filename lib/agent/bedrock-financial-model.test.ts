import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSend, mockClient } = vi.hoisted(() => {
  const mockSend = vi.fn()
  const mockClient = vi.fn(function (this: { send: typeof mockSend }) {
    this.send = mockSend
  })
  return { mockSend, mockClient }
})

vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: mockClient,
  ConverseCommand: class ConverseCommand {
    constructor(readonly input: unknown) {}
  },
}))

import { generateBedrockProspectingSummary } from './bedrock-financial-model'
import { calculateSolarValuation } from '../solar-valuation'

const coords = { lat: -31.4201, lon: -64.1888 }
const valuation = calculateSolarValuation({ coords, areaHa: 15, topology: 'single_axis_tracker' })

function generateSummary(deciderEngine: 'strands-decider-2b' | 'heuristic-fallback' = 'heuristic-fallback', deciderModel: string | null = null) {
  return generateBedrockProspectingSummary({ metrics: valuation, coords, deciderLatencyMs: 84, deciderEngine, deciderModel })
}

describe('Amazon Bedrock Financial Model Synthesis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('BEDROCK_ENABLED', 'false')
    vi.stubEnv('AWS_REGION', 'us-east-1')
    vi.stubEnv('BEDROCK_MODEL_ID', '')
  })

  afterEach(() => vi.unstubAllEnvs())

  it('uses an explicitly enabled Converse result and attributes it to Bedrock', async () => {
    vi.stubEnv('BEDROCK_ENABLED', 'true')
    mockSend.mockResolvedValue({
      output: { message: { content: [{ text: 'A live investment thesis.' }] } },
    })

    const summary = await generateSummary('strands-decider-2b', 'checkpoint-name')

    expect(summary).toMatchObject({
      executiveSummary: 'A live investment thesis.',
      engine: 'amazon-bedrock',
      modelId: 'amazon.nova-micro-v1:0',
    })
    expect(summary.fallbackReason).toBeUndefined()
    expect(mockClient).toHaveBeenCalledWith({ region: 'us-east-1' })
    expect(mockSend).toHaveBeenCalledOnce()
    const command = mockSend.mock.calls[0][0]
    expect(command.input).toMatchObject({
      modelId: 'amazon.nova-micro-v1:0',
      inferenceConfig: { maxTokens: 600, temperature: 0.3 },
    })
    const request = command.input as { messages: Array<{ content: Array<{ text: string }> }> }
    const prompt = request.messages[0].content[0].text
    expect(prompt).toContain('An accepted response from the configured endpoint passed the expected contract and model-name checks')
    expect(prompt).toContain('reported model: checkpoint-name')
    expect(prompt).toContain('Endpoint identity and underlying binary/checkpoint execution are not independently verified.')
    expect(prompt).not.toContain('validated remote Strands Decider response')
  })

  it('uses an explicitly labeled local summary and makes no SDK call when disabled', async () => {
    const summary = await generateSummary()

    expect(summary.executiveSummary).toContain('15.0 hectáreas')
    expect(summary.engine).toBe('local-fallback')
    expect(summary.modelId).toBeNull()
    expect(summary.fallbackReason).toBe('disabled')
    expect(summary.frugalAnalysis).toContain('Modelo determinístico de alta precisión')
    expect(mockClient).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('instructs Bedrock not to claim Decider execution when the decision used a local fallback', async () => {
    vi.stubEnv('BEDROCK_ENABLED', 'true')
    mockSend.mockResolvedValue({
      output: { message: { content: [{ text: 'A provenance-aware summary.' }] } },
    })

    await generateSummary('heuristic-fallback', null)

    const request = mockSend.mock.calls[0][0].input as {
      messages: Array<{ content: Array<{ text: string }> }>
    }
    const prompt = request.messages[0].content[0].text
    expect(prompt).toContain('A local heuristic fallback selected the tool')
    expect(prompt).toContain('no Strands Decider 2B inference is established')
    expect(prompt).toContain('Do not claim Decider 2B ran at the edge')
    expect(prompt).toContain('do not assert that an underlying Decider binary or checkpoint executed unless that is independently verified')
  })

  it('falls back with a request failure reason when Converse rejects', async () => {
    vi.stubEnv('BEDROCK_ENABLED', 'true')
    mockSend.mockRejectedValue(new Error('mocked SDK failure'))

    const summary = await generateSummary()

    expect(summary.engine).toBe('local-fallback')
    expect(summary.modelId).toBeNull()
    expect(summary.fallbackReason).toBe('request_failed')
    expect(summary.frugalAnalysis).toContain('request_failed')
    expect(mockSend).toHaveBeenCalledOnce()
  })

  it.each([
    ['missing text', { output: { message: { content: [] } } }],
    ['blank text', { output: { message: { content: [{ text: '   ' }] } } }],
    ['malformed output', {}],
  ])('falls back with an invalid response reason for %s', async (_label, response) => {
    vi.stubEnv('BEDROCK_ENABLED', 'true')
    mockSend.mockResolvedValue(response)

    const summary = await generateSummary()

    expect(summary.engine).toBe('local-fallback')
    expect(summary.modelId).toBeNull()
    expect(summary.fallbackReason).toBe('invalid_response')
    expect(summary.frugalAnalysis).toContain('invalid_response')
    expect(mockSend).toHaveBeenCalledOnce()
  })
})
