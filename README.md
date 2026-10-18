# Kuarahy AX

Kuarahy AX is a bilingual Next.js demo of solar telemetry, tool selection, parcel valuation, and executive-summary generation. Solar telemetry, equipment behavior, and financial results are simulated locally. A configured Strands Decider endpoint and Amazon Bedrock are optional; the app can run its local decision and summary fallbacks without either integration.

## Run the local demo

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The UI starts with sample values and reports the provenance of each completed decision and summary. No physical solar equipment is controlled. Map tiles are requested from OpenStreetMap, and the app build fetches Google Fonts through `next/font`; those resources require network access. Request duration is per request, not a P95 benchmark; this app does not measure inference energy use or compare model efficiency.

## Optional server-side integrations

Create an ignored local `.env.local` in the project root. Never put credentials in this file or commit it. Next.js loads these values on the server; keep them unprefixed (do not use `NEXT_PUBLIC_`). Restart the dev server after changing them.

### Strands Decider choice endpoint

```dotenv
STRANDS_DECIDER_ENDPOINT=http://localhost:8000/v1/systemone
STRANDS_DECIDER_MODEL=strands-decider-2b
```

Set the endpoint to the server's full `POST /v1/systemone` URL and set `STRANDS_DECIDER_MODEL` to the exact checkpoint/model name returned in the response's `model` field. A missing endpoint, failed request, or invalid/mismatched response is shown as a local heuristic fallback. The client checks the response contract and model-name string; it cannot prove the endpoint's identity or which binary/checkpoint ran. The operator must verify that independently before describing a response as actual Strands Decider inference.

### Amazon Bedrock summary

```dotenv
BEDROCK_ENABLED=true
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

Bedrock is disabled unless `BEDROCK_ENABLED=true`. The server uses the AWS SDK default credential provider chain only after it is enabled. Configure credentials through the AWS-supported mechanism for your environment and make sure the selected region and model access are valid. This project does not inspect credentials. When disabled or when a request fails, a visibly labeled local simulated summary is used instead.

These are configuration examples, not evidence of a successful remote invocation. **No Strands endpoint or Bedrock call was made while preparing this change.** Do not enable the integrations until you are ready to incur any applicable service usage and have authorized access.

## Verification

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Financial projections are illustrative outputs of the local valuation model and are not investment advice. See [REUSABLE_DECIDER_PATTERN.md](./REUSABLE_DECIDER_PATTERN.md) for the current decision-selection implementation and limitations.
