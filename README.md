# SolariA

> **Autonomous Solar Telemetry, Global Prospecting & Frugal AI Synthesis**  
> Pairing deterministic edge decisions (**AWS Strands Decider 2B**) with high-level executive financial synthesis (**Amazon Bedrock & Amazon Nova Lite**).

![SolariA Platform Overview](./readme.png)

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Nova_Lite-FF9900?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/bedrock/)
[![Vitest](https://img.shields.io/badge/Vitest-46_Passed-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Bilingual](https://img.shields.io/badge/i18n-en--US%20%7C%20es--AR-teal?style=flat-square)](#bilingual-experience)

---

## Executive Overview

**SolariA** transforms solar field prospecting and hardware operations from static telemetry dashboards into a verifiable financial intelligence platform. Grounded in Werner Vogels' **"The Frugal Architect"** design principles:

1. **Sub-115ms Edge Decisioning**: Real-time solar tracking, storm stow, and hardware telemetry dispatch handled by deterministic edge tool selection (**AWS Strands Decider 2B** pattern), avoiding wasteful LLM token burn for high-frequency operations.
2. **On-Demand Generative Synthesis**: Heavy generative capabilities are reserved exclusively for executive financial proposals and land yield summaries via **Amazon Bedrock** (`amazon.nova-lite-v1:0`), invoked only when high-level human communication is required.
3. **Resilient Local Fallback**: Zero external downtime dependencies. If Bedrock or the edge decider endpoint is unreachable, the system automatically falls back to an autonomous local valuation engine while explicitly identifying decision provenance.

---

## Key Pillars & Capabilities

### 1. Global Solar Corridor Heatmap & Prospecting
- **Interactive Multi-Region Map**: Powered by MapLibre GL with smooth tile caching across major global solar corridors:
  - *Global Overview*
  - *South America* (Atacama, Cuyo, Chaco)
  - *North America* (Mojave, Sonora, Texas Corridor)
  - *Europe & MENA* (Iberia, Sahara, Arabian Peninsula)
  - *Asia-Pacific* (Thar Desert, Western Australia, Atacama counterparts)
- **Direct Normal Irradiance (DNI)**: Dynamic spatial lookup correlating latitude, longitude, and historical irradiance.
- **Topology & Capacity Modeling**: Instant financial valuation for Single-Axis Trackers, Fixed-Tilt Bifacial arrays, and Agrivoltaics Dual-Use deployments (CapEx, OpEx, Gross Annual Revenue, Simple Payback, and 10/20-Year Net Return).

### 2. Digital Twin & Live Solar Telemetry
- **Precision Solar Arc**: Real-time solar azimuth and solar altitude calculations based on user clock or simulation scrubbers.
- **Bi-Directional Kinematic Simulation**: Visual representation of solar tracker tilt and orientation matching the sun's trajectory.
- **Open-Meteo Integration**: Live hourly telemetry curves including Direct Normal Irradiance ($W/m^2$), ambient temperature, and wind speed.

### 3. Frugal AI Architecture & Decision Provenance
- **AWS Strands Decider 2B Pattern**: Evaluates live environmental sensor signals (e.g., wind gusts > 65 km/h, rain cleaning windows, tracking angles) and selects actuation tools deterministically in milliseconds.
- **Amazon Bedrock Executive Synthesis**: Synthesizes a structured 2-paragraph investment thesis, financial highlights, and frugal architecture notes using the official `@aws-sdk/client-bedrock-runtime` and Bedrock Converse API.
- **Transparent Provenance**: The UI and API clearly label every output's origin (`strands-decider-2b` vs `heuristic-fallback` and `amazon-bedrock` vs `local-fallback` with fallback reasons such as `disabled`, `request_failed`, or `invalid_response`).

---

## Quickstart

### Prerequisites
- Node.js `^20.0.0 || ^22.0.0`
- npm `^10.0.0`

### 1. Clone & Install
```bash
git clone https://github.com/DavidBritto/kuarahy.git
cd kuarahy
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> The application runs out of the box in **Autonomous Local Mode** with zero cloud credentials required. Map tiles are served via OpenStreetMap, fonts are loaded via Next.js Google Fonts, and solar valuation operates via the deterministic local engine.

---

## Server-Side Integrations (Optional)

To enable live remote endpoints for hackathons or live demonstrations, create an untracked `.env.local` in the project root:

```dotenv
# AWS Strands Decider 2B Endpoint (Self-Hosted Edge Service)
STRANDS_DECIDER_ENDPOINT=http://127.0.0.1:8000/v1/systemone
STRANDS_DECIDER_MODEL=replace-with-model-name-from-health

# Amazon Bedrock Synthesis
BEDROCK_ENABLED=true
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
```

### Configuration Notes
- **Strands Decider 2B**: Points to a self-hosted loopback server. The application validates contract adherence and checks the model name against the `/health` endpoint. If unreachable or mismatched, the UI gracefully labels and uses the edge heuristic fallback.
- **Amazon Bedrock**: Disabled by default unless `BEDROCK_ENABLED=true`. When enabled, the AWS SDK default credential provider chain is used (`~/.aws/credentials`, environment variables, or IAM role). In-region inference for Nova Lite is verified in `us-east-1` and `us-west-2`.
- **Fault-Tolerant Resilience**: If the Bedrock request fails (e.g., throttling, network failure, or account verification hold), the API immediately returns a labeled local simulated summary without disrupting user interaction.

---

## Verification & Testing Suite

All features, financial math, and fallback mechanisms are covered by automated tests:

```bash
# Run Vitest test suite (46 unit & integration tests)
npm test

# Verify TypeScript types
npx tsc --noEmit

# Code styling & linting
npm run lint

# Production build test
npm run build
```

---

## Bilingual Experience

SolariA includes zero-dependency, type-safe internationalization:
- **English (US)**: Default international presentation for global investors.
- **Español (Rioplatense / LatAm)**: Tailored copy for regional operators and Latin American clean energy stakeholders.

Toggle language dynamically in the top navigation bar without page reload.

---

## Compliance & Disclaimer

Financial projections, installed capacity figures, and land yield metrics are illustrative outputs from the deterministic valuation model and do not constitute certified project economics or financial advice. Decision provenance metadata must be reviewed prior to operational reliance. See [`REUSABLE_DECIDER_PATTERN.md`](./REUSABLE_DECIDER_PATTERN.md) for detailed tool-selection design and integration patterns.
