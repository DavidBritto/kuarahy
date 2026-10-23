# SolariA: Autonomous Solar Mechatronics & Financial Prospecting with AWS Strands Decider 2B and Amazon Bedrock

> **Hackathon Submission:** AWS Agent Experience Hackathon: Strands Decider  
> **Official Challenge Tags:** `#strands-decider-2b` · `#tool-selection`  
> **Additional Categories:** `#aws-bedrock` · `#the-frugal-architect` · `#clean-energy` · `#digital-twin`  
> **Open Source Repository:** [https://github.com/DavidBritto/kuarahy](https://github.com/DavidBritto/kuarahy)  
> **Author:** David Britto  

---

## 1. Executive Summary & The Frugal Architecture Paradox

Solar photovoltaic energy is the world's most abundant clean power resource. Yet, utility-scale solar farms and commercial installations face two chronic engineering bottlenecks:

1. **Cosine Incidence Loss (up to 30% lost MWh):** Fixed-tilt arrays only capture peak normal irradiance for a narrow window around solar noon. Throughout morning and late afternoon, angular misalignment dissipates generation potential.
2. **Particulate Soiling & Manual Labor Overhead:** Dust, agricultural pollen, and sand accumulate on panel glass, reducing generation by up to 15%. Mitigation traditionally requires contracting costly manual washing crews with high freshwater consumption.

### The Frugal AI Paradox
The naive modern response to automation is deploying heavy, energy-guzzling 70B+ LLMs in hyperscale datacenters. For robotics and industrial mechatronics, this creates an ecological and economic paradox: **burning megawatts of cloud compute to optimize kilowatts of clean energy**. Furthermore, a motor gearbox operating in sudden 65 km/h wind gusts cannot wait 2,000 milliseconds for a multi-billion parameter cloud model to generate natural language.

**SolariA** solves this paradox by strictly implementing Werner Vogels' **"The Frugal Architect"** design philosophy:
- **Sub-115ms Edge Decisioning:** Real-time hardware telemetry and tool dispatch are executed locally by **AWS Strands Decider 2B**, guaranteeing deterministic safety and zero token waste.
- **On-Demand Generative Synthesis:** Heavy generative capabilities are reserved exclusively for human-facing capital investment reporting and land yield summaries via **Amazon Bedrock (Amazon Nova Lite)**, triggered only when strategic communication is required.

---

## 2. System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │                PHYSICAL / VIRTUAL EDGE                 │
               │   • Real-Time Solar Azimuth & Elevation (Open-Meteo)   │
               │   • Anemometer (Wind Gusts) & Rain Gauges (Precip)     │
               │   • Pyranometer (DNI / GTI) & Battery State of Charge  │
               └───────────────────────────┬────────────────────────────┘
                                           │ Sub-115ms Telemetry
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │              AWS STRANDS DECIDER 2B                    │
               │               (#tool-selection Engine)                 │
               │                                                        │
               │   [1] follow_sun_optimal_tracking                      │
               │   [2] clean_panels_rainwash (Tilt 65°)                 │
               │   [3] emergency_storm_stow (Tilt 0°)                   │
               │   [4] battery_conservation_hold                        │
               └───────────────────────────┬────────────────────────────┘
                                           │ Selected Mechatronic State
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                          SOLARIA INTERACTIVE PLATFORM                             │
│                                                                                   │
│  ┌───────────────────────────────┐     ┌───────────────────────────────────────┐  │
│  │   SOLAR DIGITAL TWIN (SVG)    │     │      GLOBAL HEATMAP PROSPECTING       │  │
│  │ • 24h Kinematic Solar Arc     │     │ • Multi-Corridor MapLibre GL Layer    │  │
│  │ • Bi-directional Tracker Tilt │     │ • Dynamic DNI & Land Surface (Ha)     │  │
│  │ • Real-Time Open-Meteo Curve  │     │ • Topology: Trackers / Bifacial / Agri│  │
│  └───────────────────────────────┘     └───────────────────┬───────────────────┘  │
│                                                            │                      │
│                                                            ▼                      │
│                                        ┌───────────────────────────────────────┐  │
│                                        │        AMAZON BEDROCK SYNTHESIS       │  │
│                                        │       (Model: Amazon Nova Lite)       │  │
│                                        │ • 2-Paragraph Investment Thesis       │  │
│                                        │ • CapEx, Gross Revenue & Simple ROI   │  │
│                                        │ • Resilient Autonomous Fallback       │  │
│                                        └───────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Components & Implementation

### A. Sub-115ms Edge Tool Selection (`#tool-selection`)
The decision selector in [`lib/agent/decider-tool-selection.ts`](https://github.com/DavidBritto/kuarahy/blob/main/lib/agent/decider-tool-selection.ts) exposes a reusable typed-choice dispatch contract designed for **AWS Strands Decider 2B**:

```typescript
export interface DeciderChoice {
  id: string
  name: string
  description: string
}

export const SOLAR_ACTUATION_CHOICES: DeciderChoice[] = [
  { id: 'follow_sun_optimal_tracking', name: 'Follow Sun (Optimal Tracking)', description: 'Rotate panel to perpendicular angle.' },
  { id: 'clean_panels_rainwash', name: 'Clean Panels (Rainwash Mode)', description: 'Tilt panel to 65 deg during rainfall to wash surface.' },
  { id: 'emergency_storm_stow', name: 'Emergency Storm Stow', description: 'Stow panels flat to 0 deg during wind gusts > 60 km/h.' },
  { id: 'battery_conservation_hold', name: 'Battery Conservation Hold', description: 'Lock motors when battery SoC is critically low.' },
]
```

When evaluated, the system determines the optimal operational tool based on live physical constraints:
- **Wind Gusts > 60 km/h:** Actuates `emergency_storm_stow` (0° horizontal) in milliseconds to prevent mechanical shear.
- **Rain > 1.5 mm/h + Soiling > 4%:** Actuates `clean_panels_rainwash` (65° steep angle), turning natural rainfall into an automated pressure-cleaning system that eliminates manual washing contracts.
- **Normal Sunlight:** Continuously tracks the solar vector (`follow_sun_optimal_tracking`), maximizing kilowatt production.

### B. On-Demand Executive Synthesis with Amazon Bedrock
When landowners or energy investors select a field parcel on the global heatmap, the system calls Amazon Bedrock using the official `@aws-sdk/client-bedrock-runtime` and Bedrock Converse API with **Amazon Nova Lite** (`amazon.nova-lite-v1:0`):

```typescript
const client = new BedrockRuntimeClient({ region: 'us-west-2' })
const command = new ConverseCommand({
  modelId: 'amazon.nova-lite-v1:0',
  messages: [{ role: 'user', content: [{ text: prompt }] }],
  inferenceConfig: { maxTokens: 600, temperature: 0.3 },
})
const response = await client.send(command)
```

The model generates:
1. An executive 2-paragraph investment thesis customized to the site's DNI, topology, and surface acreage.
2. Three bulleted key financial highlights (CapEx amortization, 10-year net cash return, CO2 offset).
3. A Frugal Architecture note explicitly reporting decision provenance.

### C. Graceful Degradation & Provenance Tracking
In alignment with enterprise reliability principles, SolariA is **100% resilient**:
- If external credentials, network connectivity, or daily quotas are unavailable, the application automatically falls back to its deterministic local valuation engine (`local-fallback`).
- Every calculation clearly documents its origin (`engine: 'amazon-bedrock'` vs `engine: 'local-fallback'`, with explicit fallback reasons such as `disabled`, `request_failed`, or `invalid_response`).

---

## 4. Multi-Region Global Solar Corridor Heatmap

Built with **MapLibre GL** and vector tile caching, the prospecting engine lets developers evaluate land parcels across 4 major global solar corridors:
- **South America:** Atacama (highest solar irradiation on Earth), Cuyo, and Gran Chaco corridors.
- **North America:** Mojave Desert, Sonoran Corridor, and the Texas Solar Belt.
- **Europe & MENA:** Iberian Peninsula, Sahara border regions, and the Arabian Gulf.
- **Asia-Pacific:** Thar Desert, Western Australia, and Queensland.

Users can simulate three distinct technological topologies:
- **Single-Axis Trackers:** High yield with dynamic motor actuation.
- **Fixed-Tilt Bifacial:** Ground-albedo reflective capture.
- **Agrivoltaics Dual-Use:** Elevated clearance panels enabling simultaneous agriculture/grazing.

---

## 5. Verification & Testing

The repository includes a comprehensive automated test suite powered by **Vitest**:
- **46 Unit & Integration Tests**: Testing solar valuation arithmetic, Open-Meteo parsers, Strands Decider typed contracts, Bedrock mock handlers, and UI metric components.
- **TypeScript Strict Mode**: Zero compilation errors (`npx tsc --noEmit`).
- **Production Build Verified**: Fully compiled with Next.js 15 Turbopack for production SSR deployment.

```bash
# Run test suite
npm test

# Run type-check
npx tsc --noEmit
```

---

## 6. What We Learned & Conclusion

Building SolariA demonstrated that the future of agentic AI is not about monolithic models running everywhere. It is about **architectural discipline**:
1. Use **small, fast models at the edge (AWS Strands Decider 2B)** for millisecond deterministic physical safety and tool selection.
2. Use **cost-effective cloud models (Amazon Bedrock & Amazon Nova Lite)** for high-level generative synthesis.
3. Keep the platform operational and useful at all times through verified local fallbacks.

By pairing mechatronics with AWS agent technology, we turn clean energy generation into an intelligent, autonomous, and self-optimizing cyber-physical system.

---

### Links & Resources
- **GitHub Repository:** [DavidBritto/kuarahy](https://github.com/DavidBritto/kuarahy)
- **Demo Script & Scenarios:** [`DEMO_VIDEO_SCRIPT.md`](https://github.com/DavidBritto/kuarahy/blob/main/DEMO_VIDEO_SCRIPT.md)
- **Reusable Decider Pattern:** [`REUSABLE_DECIDER_PATTERN.md`](https://github.com/DavidBritto/kuarahy/blob/main/REUSABLE_DECIDER_PATTERN.md)
