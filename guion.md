# SolariA AX — bilingual demo video outline

**Target duration:** 2:50
**Local app:** `http://localhost:3000`
**Tags:** `#strands-decider-2b` · `#tool-selection`

This script reflects the current application. Solar telemetry, equipment behavior, and parcel results are simulated locally. Local decision and summary fallbacks work without configured Decider or Bedrock integrations. The map uses OpenStreetMap tiles and the build fetches Google Fonts through `next/font`, so those resources require network access. The interface reports whether a decision came from a response accepted from the configured endpoint or the local heuristic, and whether a project summary came from Bedrock or the local fallback. Contract and model-name checks do not prove the endpoint's identity or actual binary/checkpoint execution; verify those with its operator before claiming real Strands Decider inference. Do not imply a live service call unless that specific recording was made with the integration enabled and its provenance is visible. No physical equipment is connected.

## Before recording

1. Start the app with `npm run dev`; open the local URL.
2. Use the provenance labels as displayed. If an optional integration is enabled for a separate authorized recording, show its reported model/source and retain evidence for that run; verify endpoint identity independently before describing it as actual Strands Decider inference.
3. Demonstrate both interface languages with the `[EN | ES]` control.
4. Do not present the demo's per-request duration as P95 latency or make energy-efficiency, field-savings, or hardware-safety claims.

## Timeline and bilingual narration

### 0:00–0:30 — Introduce the simulation

**Visual:** Open the dashboard. Show the scenario controls and the disclosure that equipment behavior is simulated.

**English voiceover:**
> “SolariA AX is a bilingual solar-operations demo. It simulates telemetry and tracker scenarios so we can explore decision flows in a safe, repeatable interface. It is not connected to field sensors or physical equipment.”

**Locución en español:**
> “SolariA AX es una demo bilingüe de operación solar. Simula telemetría y escenarios de seguimiento para explorar flujos de decisión desde una interfaz repetible. No está conectada a sensores de campo ni a equipos físicos.”

### 0:30–1:15 — Show decision provenance

**Visual:** Change a solar scenario and point to the decision card. Show the initial sample label, then the source label and reason returned by the configured path. The endpoint is optional; a local heuristic is used when it is absent or returns an unusable response. The label reflects contract/model-name validation, not independent proof of endpoint identity or model execution.

**English voiceover:**
> “The server can send a typed-choice request to an endpoint configured to serve Strands Decider. The interface distinguishes a response that passes the expected contract and model-name checks from the local heuristic fallback and explains the fallback reason. Those checks do not independently verify the endpoint or model; the displayed duration is for this individual request, not a percentile benchmark.”

**Locución en español:**
> “El servidor puede enviar una solicitud de elección tipada a un endpoint configurado para ofrecer Strands Decider. La interfaz distingue una respuesta que supera las validaciones de contrato y nombre del modelo del fallback heurístico local, e informa el motivo del fallback. Esas validaciones no verifican por sí solas la identidad del endpoint ni el modelo ejecutado. La duración corresponde a esta solicitud individual; no es un benchmark de percentiles.”

### 1:15–1:50 — Explain the reusable pattern

**Visual:** Show `lib/agent/decider-tool-selection.ts` and `REUSABLE_DECIDER_PATTERN.md`. Highlight choice registration, request construction, response validation, and fallback metadata.

**English voiceover:**
> “The reusable pattern is a TypeScript selector with a typed request, validation against registered choices, and explicit provenance. The project does not measure inference energy or compare model performance, so we make no efficiency-ratio claim.”

**Locución en español:**
> “El patrón reutilizable es un selector TypeScript con una solicitud tipada, validación de las opciones registradas y procedencia explícita. El proyecto no mide la energía de inferencia ni compara el rendimiento de modelos; por eso no afirmamos una relación de eficiencia.”

### 1:50–2:30 — Show local estimates and optional Bedrock provenance

**Visual:** Open the MapLibre prospecting view, adjust area/topology, then open the generated project summary. Point out that financial figures are estimates from a local model. Map tiles require network access. Show whether the summary is labeled as a Bedrock result or as a local simulation; if the latter, show its reason.

**English voiceover:**
> “The parcel view calculates illustrative capacity and financial estimates locally. Summary generation can optionally use Amazon Bedrock when enabled on the server. The modal identifies the source and model when a usable Bedrock response is returned; otherwise it labels the local simulated summary. These projections are not verified project economics.”

**Locución en español:**
> “La vista de parcelas calcula localmente estimaciones ilustrativas de capacidad y resultados financieros. La generación del resumen puede usar Amazon Bedrock si está habilitado en el servidor. El modal identifica la fuente y el modelo cuando recibe una respuesta utilizable de Bedrock; de lo contrario, etiqueta el resumen simulado local. Estas proyecciones no son resultados económicos verificados.”

### 2:30–2:50 — Close in both languages

**Visual:** Switch from English to Spanish and back. End on the dashboard's simulation and measurement disclosures.

**English voiceover:**
> “SolariA AX keeps remote inference integrations optional and makes the local fallback visible. The code and documentation explain how to configure those integrations and what the demo does—and does not—measure.”

**Locución en español:**
> “SolariA AX mantiene opcionales las integraciones de inferencia remota y hace visible el fallback local. El código y la documentación explican cómo configurarlas y qué mide —y qué no mide— la demo.”
