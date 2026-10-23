# Reusable tool-selection pattern

This repository includes a TypeScript selector that submits a typed choice request to a configured HTTP endpoint and validates the response contract. A successful response is labeled as a remote endpoint result only when its model-name string matches the requested value. The client cannot verify the endpoint's identity or which binary/checkpoint ran; the operator must verify that independently before claiming actual Strands Decider inference. If no endpoint is configured, the request fails, or the response is invalid, the selector returns a domain-specific local heuristic result with `engine: 'heuristic-fallback'` and a `fallbackReason`. It does not silently label local decisions as model inference.

## Current capabilities and limits

| Capability | Current behavior |
| --- | --- |
| Request | `DeciderToolSelector.evaluate` sends a `POST` to the configured endpoint using the `/v1/systemone` typed choice request shape. |
| Validation | The response must name the requested model, contain a `tool_selection` choice, select a registered option, and provide confidence from 0 to 1. |
| Attribution | A contract-valid response with a matching model-name string is labeled as a remote endpoint result; the returned model name is retained. Operator verification is required to establish endpoint identity or actual model execution. |
| Local fallback | A local heuristic is used when the endpoint is absent, fails, or returns an invalid response. Its provenance and reason are returned explicitly. |
| Measurements | Per-call elapsed request duration is returned. Energy estimates are `null`; no comparative model benchmark or energy measurement is implemented. |
| AWS Strands SDK | `asStrandsInterventionHandler()` returns a small adapter-shaped object, but this repository does not install or exercise the AWS Strands SDK integration. |
| Physical control | The SolariA UI and API simulate telemetry and actuation values. They do not connect to sensors, motors, or a physical tracker. |

The selector and its tests live in `lib/agent/decider-tool-selection.ts` and `lib/agent/decider-tool-selection.test.ts`. The SolariA-specific example registers domain choices and supplies a solar telemetry heuristic. Do not treat those simulated values as field evidence.

## Configure the optional endpoint

In the app repository, add a server-only `.env.local` file (ignored by Git):

```dotenv
STRANDS_DECIDER_ENDPOINT=http://127.0.0.1:8000/v1/systemone
STRANDS_DECIDER_MODEL=replace-with-model-name-from-health
```

This is a loopback URL for a self-hosted Decider server; it is not an AWS-managed endpoint, and this app does not download or launch that server. Check the server's `/health` response and set `STRANDS_DECIDER_MODEL` to its actual model name. That value must also exactly match the response's top-level `model` field. A name mismatch is rejected and produces the local heuristic fallback. This string check does not establish the server's identity or the binary/checkpoint actually used; verify those with the endpoint operator. Do not add a `NEXT_PUBLIC_` prefix: the endpoint is consumed by the server route and should not be exposed to browser code.

Generic use follows the actual selector configuration:

```typescript
const selector = new DeciderToolSelector<MyState, MyTool>({
  question: 'Which registered tool should handle this state?',
  options: myTools,
  extractState: (state) => ({ intent: state.intent, hasOrder: state.hasOrder }),
  endpointUrl: process.env.STRANDS_DECIDER_ENDPOINT,
  model: process.env.STRANDS_DECIDER_MODEL,
})

const decision = await selector.evaluate(currentState)
if (decision.engine === 'heuristic-fallback') {
  console.info('Local fallback:', decision.fallbackReason)
}
```

The response includes `engine`, `model`, `fallbackReason` when applicable, `latencyMs`, and `whEstimated: null`. Record enough request and environment context before making performance claims; one request duration is not a percentile or model-to-model comparison.

## Optional Bedrock synthesis in this app

The prospecting API only calls Bedrock when explicitly enabled on the server:

```dotenv
BEDROCK_ENABLED=true
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
```

Nova Micro is the default because it supports Converse and is intended for low-latency, low-cost summarization. The [AWS model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-micro.html) lists `us-east-1` for in-region inference; examples use that region and do not imply support in other regions. The AWS SDK default credential provider chain is used after opt-in. Configure credentials through your AWS environment's normal mechanism; this code does not inspect them. When Bedrock is disabled or the call fails, the API returns an explicitly labeled local simulated summary with a fallback reason. The repository's automated tests use mock responses and do not prove that a live service call succeeded.

**No Decider endpoint or Bedrock invocation was made while updating this pattern.** Configuration examples show how a developer can opt in later; they are not evidence of inference, measured latency, measured energy, or savings.
