# ☀️ SolariA AX — Autonomous Frugal Solar Agent
## AWS Agent Experience Hackathon (October 16 – 23, 2026)

> **Architectural Thesis:** Built strictly under Werner Vogels' **"The Frugal Architect"** laws.  
> Using heavy, energy-guzzling 70B+ LLMs in giant cloud datacenters to manage green solar energy is an ecological and economic paradox (burning megawatts to save kilowatts). **SolariA AX** deploys **AWS Strands Decider 2B** for sub-115ms deterministic decision making and tool dispatching, paired with **Amazon Bedrock** for high-level generative synthesis and executive investment reporting.

---

## 📋 Hackathon Requirements & Qualification Matrix

| Requirement | Implementation in SolariA AX | Status |
| :--- | :--- | :--- |
| **Strands Decider 2B** | Evaluates parcel prospecting feasibility & high-frequency tracker/battery dispatch (<115ms). | 🟡 In Progress |
| **Amazon Bedrock** | Generates executive financial reports, ROI projections, and land yield synthesis. | ⚪ Pending |
| **Decision Pattern Tag** | `#tool-selection` (declared pattern) + `#strands-decider-2b`. | 🟢 Defined |
| **Reusable Asset** | Standalone decision pattern module (`lib/agent/decider-tool-selection.ts`) for builders. | ⚪ Pending |
| **Public Repository** | GitHub repo with clean architecture, test coverage, and documentation. | 🟡 In Progress |
| **Builder Center Article** | In-depth story detailing architecture, Werner Vogels' thesis, and benchmark results. | ⚪ Pending |
| **Demo Video (< 3 min)** | Screen capture showing interactive map parcel selection, Decider 2B dispatch, and Bedrock summary. | ⚪ Pending |
| **Latency/Cost Benchmark** | Measured comparison: Strands Decider 2B (~115ms, $0.0001) vs Frontier LLM (~1800ms, $0.015). | ⚪ Pending |

---

## 🏛️ System Architecture

```
                                      ┌───────────────────────────────────────────────┐
                                      │             PROSPECTING LAYER (UI)            │
                                      │  MapLibre GL Heatmap + Hectare Field Selector │
                                      └───────────────────────┬───────────────────────┘
                                                              │ Coordinates + Area (ha)
                                                              ▼
                                      ┌───────────────────────────────────────────────┐
                                      │             SOLAR DATA HARVESTER              │
                                      │   Open-Meteo GTI / DNI + SunCalc Solar Arc    │
                                      └───────────────────────┬───────────────────────┘
                                                              │ Physical Telemetry State
                                                              ▼
                                      ┌───────────────────────────────────────────────┐
                                      │      AWS STRANDS DECIDER 2B (< 115ms)         │
                                      │           [Pattern: #tool-selection]          │
                                      └───────┬───────────────┼───────────────┬───────┘
                                              │               │               │
                     ┌────────────────────────┘               │               └────────────────────────┐
                     ▼                                        ▼                                        ▼
       `dispatch_tracker_actuation`              `dispatch_battery_arbitrage`             `dispatch_prospecting_assessment`
       (Dual/Single-Axis Tilt)                  (Charge / Discharge / Grid Peak)          (Utility-Scale / Agrivoltaics / Rooftop)
                     │                                        │                                        │
                     └────────────────────────────────────────┼────────────────────────────────────────┘
                                                              ▼
                                      ┌───────────────────────────────────────────────┐
                                      │          AMAZON BEDROCK SYNTHESIS             │
                                      │      Executive Financial Model & Yield Report │
                                      │        ("Hectare X produces $Y over Z yrs")   │
                                      └───────────────────────────────────────────────┘
```

---

## 🗺️ Key Features

### 1. Interactive Solar Heatmap & Parcel Prospecting (MapLibre GL)
- WebGL GPU-accelerated map with global satellite/terrain base layers (no paid API key lock-in).
- Heatmap overlay representing Global Tilted Irradiance (GTI) and solar radiation potential.
- Interactive parcel drawing / box selector: click or drag over rural fields to get immediate polygon coordinates and hectare calculations.

### 2. Autonomous Decision Engine (AWS Strands Decider 2B)
- **Reusable Asset:** `DeciderToolSelectionPattern` providing typed schema and handler for AWS Strands agents.
- **Sub-115ms decision loop:** Evaluates terrain slope, irradiance delta, grid proximity, and spot energy prices to pick the optimal tool/action.
- Frugal Architecture metric: Real-time telemetry counter displaying Decider 2B response time and Watt-hour energy saved vs standard LLMs.

### 3. Executive Financial Synthesis (Amazon Bedrock)
- Turns technical solar telemetry into plain-business investment metrics:
  - Estimated capital expenditure (CapEx) per hectare.
  - Annual megawatt-hour (MWh) generation potential.
  - Multi-year revenue projection ($X in Y years) under localized grid tariff curves.

### 4. High-End UI Restyling
- Dark Obsidian / Solar Ember aesthetic.
- Split layout: Interactive Map on left/main canvas, Solar Arc + Live Decider 2B Decision Ticker + Bedrock Financial Drawer on right/bottom.

---

## 📅 7-Day Sprint Roadmap (Deadline: Oct 23, 2026 · 11:59 PM PDT)

```
Oct 16 ──► Oct 17 ──► Oct 18 ──► Oct 19 ──► Oct 20 ──► Oct 21 ──► Oct 22 ──► Oct 23 (DEADLINE)
[Brain & Reusable Asset] ──► [Solar Math] ──► [MapLibre] ──► [Restyle UI] ──► [Article & Demo Video]
```

### Day 1 (Oct 16–17): Core Engine & Reusable Asset
- [x] Analyze official hackathon rules, rubric, and hard deadline (Oct 23).
- [ ] Implement `lib/agent/decider-tool-selection.ts` (reusable decision asset with typed question & options).
- [ ] Implement mock & live AWS Strands Decider 2B bridge with latency logging.
- [ ] Connect Amazon Bedrock client for financial synthesis.

### Day 2 (Oct 17–18): Solar Physical Modeling & Valuation Math
- [ ] Integrate Open-Meteo Solar API (GTI, DNI, Direct Normal Irradiance).
- [ ] Implement hectare yield calculation formulas (kWp/ha, capacity factors, financial ROI projection).
- [ ] Write unit tests for solar yield equations using Vitest.

### Day 3 (Oct 18–19): MapLibre GL Integration
- [ ] Install and configure `maplibre-gl` in Next.js (client-only dynamic import).
- [ ] Render solar potential heatmap layer (raster/vector tiles).
- [ ] Implement interactive parcel selection with live area/hectare computation.

### Day 4 (Oct 19–20): Frontend Restyling & Dashboard Integration
- [ ] Restyle dashboard into Dark Obsidian / Solar Ember theme with Tailwind CSS.
- [ ] Integrate `SolarArc.tsx` canvas with live parcel telemetry.
- [ ] Build real-time Decision Stream component showcasing Decider 2B sub-115ms telemetry.

### Day 5 (Oct 20–21): Latency Benchmark & Reusable Library Packaging
- [ ] Build benchmark suite: Decider 2B vs Amazon Bedrock Claude for tool selection (latency & cost delta).
- [ ] Extract reusable pattern documentation (`REUSABLE_PATTERN.md`) for public consumption.
- [ ] End-to-end integration tests.

### Day 6 (Oct 21–22): Content Creation (Article & Demo Video)
- [ ] Draft official AWS Builder Center article highlighting Werner Vogels' Frugal Architecture thesis.
- [ ] Record high-quality demo video (< 3 minutes) demonstrating map zoom, Decider 2B decision, and Bedrock report.
- [ ] Prepare 16:9 official submission banner.

### Day 7 (Oct 22–23): Final Delivery & Submission
- [ ] Push public GitHub repository with comprehensive README.
- [ ] Publish article on AWS Builder Center with `#strands-decider-2b` and `#tool-selection` tags.
- [ ] Submit project link and video on official hackathon portal before 11:59 PM PDT.
