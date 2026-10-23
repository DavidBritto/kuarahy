# SolariA: A Solar-Operations Simulation with Optional Decider and Bedrock Integrations

> **Hackathon context:** AWS Agent Experience Hackathon: Strands Decider
> **Tags:** `#strands-decider-2b` · `#tool-selection`
> **Repository:** [DavidBritto/solaria](https://github.com/DavidBritto/solaria)

SolariA is a bilingual web demo for exploring solar-tracker scenarios and parcel estimates. It keeps local decision and summary fallbacks available and reports whether a displayed result came from a configured remote integration or a local fallback. Map tiles and build-time Google Font retrieval require network access. The project is a simulation: no solar sensors, field telemetry, actuators, or physical tracker are connected.

## What the demo does

### Simulated tracker scenarios

The interface builds example daytime solar points locally and lets a viewer change scenario controls or presets. A server route evaluates the supplied values and returns simulated actuation fields such as tilt, status, and power estimates. Those values illustrate application behavior; they are not observed equipment behavior or verified energy gains.

The decision selector in [`lib/agent/decider-tool-selection.ts`](lib/agent/decider-tool-selection.ts) can send the typed-choice contract to a configured HTTP endpoint intended to serve Strands Decider. A response is labeled as a remote endpoint result only after its contract, model-name string, and registered choice validate. Those checks do not prove the endpoint's identity or which binary/checkpoint ran; the operator must verify those independently before claiming actual Strands Decider inference. If there is no endpoint, the request fails, or the response is invalid, the selector returns a local solar-domain heuristic with an explicit fallback reason. The UI distinguishes the sample state, remote endpoint response, and local fallback.

The UI's elapsed time is a per-request duration. It can include remote request time or local fallback processing; it is not a P95 benchmark. The selector reports `whEstimated: null`, and this application does not measure model energy use, compare models, or establish energy savings.

### Parcel estimates and optional summary generation

The prospecting view uses MapLibre GL and local solar/valuation calculations. Its capacity, generation, and financial figures are estimates from the application's model, not site measurements, verified project economics, or investment advice. The map base layer requests OpenStreetMap tiles, so viewing the map requires network access; no parcel or solar telemetry feed is connected.

The prospecting API calls Amazon Bedrock only when `BEDROCK_ENABLED=true`. After a successful response containing usable text, the returned summary is attributed to Amazon Bedrock and the configured model. Otherwise, it returns a labeled local simulated summary with a reason. Decision provenance is also passed into the prompt so a local Decider heuristic is not described as remote inference. Automated tests mock service responses and do not prove that a live invocation occurred.

## Configure integrations locally

Add the following to an ignored project-root `.env.local` file and restart the development server. Keep these variables server-side; do not prefix them with `NEXT_PUBLIC_` or commit credentials.

```dotenv
STRANDS_DECIDER_ENDPOINT=http://127.0.0.1:8000/v1/systemone
STRANDS_DECIDER_MODEL=replace-with-model-name-from-health

BEDROCK_ENABLED=true
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
```

The Decider URL is a self-hosted server on loopback, not an AWS-managed endpoint; this repository does not download or launch that server. Check its `/health` response and set `STRANDS_DECIDER_MODEL` to the actual model name, which must also match the response's top-level `model` field. A mismatch is rejected and uses the local fallback. The name check does not prove endpoint identity or actual binary/checkpoint execution; verify those with the endpoint operator. Bedrock remains disabled unless explicitly enabled; the AWS SDK default credential chain is used only after opt-in. Nova Lite (`amazon.nova-lite-v1:0`) is the default short-summary model and supports Converse. The [AWS model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-lite.html) lists `us-east-1` for in-region inference; this example does not imply `sa-east-1` availability. Configure credentials through the normal AWS mechanism for your environment. The application does not inspect them.

These values are examples, not evidence of a successful request. **No Strands endpoint or Bedrock invocation was made while preparing this submission update.** Do not enable remote integrations unless you have authorized access and are prepared for any applicable service usage.

## Reusable decision pattern

The selector accepts a registered list of choices and an `extractState` function, validates the typed-choice response, and returns explicit engine/model/fallback metadata. It also exposes an `asStrandsInterventionHandler()` adapter-shaped object; this repository does not install the AWS Strands SDK or demonstrate an end-to-end SDK agent integration. See [`REUSABLE_DECIDER_PATTERN.md`](REUSABLE_DECIDER_PATTERN.md) for the current API example and limitations.

## Verification and evidence boundary

Automated tests cover local rules, request validation, mocked service success/failure, and fallback labeling. They are not hardware-in-the-loop tests or live-service measurements. Do not infer latency percentiles, energy ratios, field performance, cost savings, or physical safety from the UI, synthetic presets, or mocked tests.

The current local project verification for this update is recorded in the implementation handoff. No live integration result is claimed here.
