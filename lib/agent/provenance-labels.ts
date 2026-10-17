import type { BedrockProspectingSummaryOutput } from './bedrock-financial-model'
import type { DeciderDecision } from './decider-tool-selection'

export interface DeciderProvenanceCopy {
  sample: string
  live: string
  fallback: string
  fallbackReasons: Record<NonNullable<DeciderDecision['fallbackReason']>, string>
}

export function getDeciderProvenanceMessage<TToolName extends string>(
  decision: DeciderDecision<TToolName>,
  hasResponse: boolean,
  copy: DeciderProvenanceCopy
): string {
  if (!hasResponse) return copy.sample
  if (decision.engine === 'strands-decider-2b') return copy.live
  const reason = decision.fallbackReason ? copy.fallbackReasons[decision.fallbackReason] : ''
  return [copy.fallback, reason].filter(Boolean).join(' ')
}

export interface BedrockProvenanceCopy {
  live: string
  fallback: string
}

export function getBedrockProvenanceMessage(
  summary: BedrockProspectingSummaryOutput,
  copy: BedrockProvenanceCopy
): string {
  return summary.engine === 'amazon-bedrock' ? copy.live : copy.fallback
}
