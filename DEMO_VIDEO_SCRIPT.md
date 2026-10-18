# Kuarahy AX — Demo recording outline

This script describes the current local demo. Decision and summary fallbacks work without configured Decider or Bedrock integrations. Map tiles are requested from OpenStreetMap, and the app build fetches Google Fonts through `next/font`, so those resources require network access. Contract and model-name validation cannot prove a configured endpoint's identity or actual binary/checkpoint execution; verify those with the endpoint operator before claiming real Strands Decider inference. This script does not claim a live Decider or Bedrock invocation, physical actuation, measured latency percentiles, or measured energy savings. If you record with remote integrations enabled, show their provenance labels and retain the logs/configuration needed to substantiate that specific run.

## Before recording

1. Start the app with `npm run dev` and open `http://localhost:3000`.
2. Leave integrations disabled unless you have independently configured and authorized them. The interface labels sample values, local heuristic decisions, and local Bedrock-summary fallback separately. The UI's endpoint result label is not independent verification of the endpoint's identity or model execution.
3. Use the `[EN | ES]` control to demonstrate both locales.
4. Describe this as a simulation: no sensors, tracker motors, or field telemetry are connected.

## English voiceover outline

### 0:00–0:30 — Scenario and simulation

Show the solar telemetry controls and presets.

> “Kuarahy AX is an interactive solar-operations demo. It simulates solar conditions and equipment behavior so we can inspect a set of decision scenarios. It is not connected to a physical tracker or live sensor data.”

### 0:30–1:15 — Decision provenance

Change a scenario and point to the decision card. Explain the visible source label: sample UI values before the first response, a configured endpoint response only after contract and model-name checks pass, or a local heuristic fallback otherwise. These checks do not independently establish endpoint identity or actual model execution. If a fallback appears, read its reason. Request duration is the elapsed time for that request, not a P95 benchmark.

> “The app can send the typed choice request to an endpoint configured to serve Strands Decider. Here, the UI identifies whether the response passed the expected contract and model-name checks or came from the local fallback. Those checks do not prove the endpoint's identity or model execution. The local fallback supports a demo without configured model integrations, but it is not model inference.”

### 1:15–1:55 — Reusable pattern and limits

Show `lib/agent/decider-tool-selection.ts` and `REUSABLE_DECIDER_PATTERN.md`. Point out registered options, typed request construction, response validation, and fallback provenance.

> “The reusable piece is a small TypeScript selector with an explicit contract and fallback behavior. This code reports no energy estimate, and we have not run a comparative latency or energy benchmark, so the interface avoids presenting those as measured results.”

### 1:55–2:30 — Parcel valuation and Bedrock provenance

Open the prospecting map, select a parcel, and open the generated summary. Map tiles require network access. The locally calculated valuation is an estimate. The summary panel identifies either a configured Amazon Bedrock response and model, or a local simulated summary with its fallback reason.

> “Parcel capacity and financial projections are illustrative outputs from the local valuation model, not verified project economics. Bedrock is optional: the summary itself tells us whether the configured model returned it or whether the app used its local simulation.”

### 2:30–2:50 — Close

Switch to Spanish and back to English. Avoid quantitative performance or savings claims unless separate measurements support them.

> “Kuarahy AX keeps remote inference integrations optional and makes the local fallback visible. The source and documentation explain how to configure each integration and what this demo does—and does not—measure.”

## Guion alternativo en español

### 0:00–0:30 — Escenario y simulación

Muestre los controles y presets de telemetría solar.

> “Kuarahy AX es una demo interactiva de operación solar. Simula condiciones solares y comportamiento del equipo para explorar escenarios de decisión. No está conectada a seguidores físicos ni a sensores en vivo.”

### 0:30–1:15 — Procedencia de la decisión

Cambie un escenario y señale la tarjeta de decisión. Explique las etiquetas visibles: valores de muestra antes de la primera respuesta, una respuesta aceptada del endpoint configurado solo después de validar el contrato y el nombre del modelo, o un fallback heurístico local. Esas comprobaciones no verifican por sí solas la identidad del endpoint ni el modelo ejecutado. Si aparece un fallback, lea el motivo. La duración corresponde a esa solicitud, no a un benchmark P95.

> “La aplicación puede enviar una solicitud de elección tipada a un endpoint configurado para ofrecer Strands Decider. La interfaz indica si la respuesta superó las validaciones de contrato y nombre del modelo o si se usó el fallback local. Esas comprobaciones no verifican por sí solas la identidad del endpoint ni el modelo ejecutado. El fallback permite una demo sin integraciones de inferencia configuradas, pero no es inferencia del modelo.”

### 1:15–1:55 — Patrón reutilizable y límites

Muestre `lib/agent/decider-tool-selection.ts` y `REUSABLE_DECIDER_PATTERN.md`. Señale las opciones registradas, la solicitud tipada, la validación de la respuesta y la procedencia del fallback.

> “El patrón reutilizable es un selector TypeScript pequeño, con contrato y fallback explícitos. El código no informa una estimación de energía y no hicimos un benchmark comparativo de latencia o energía; por eso la interfaz no presenta esos resultados como mediciones.”

### 1:55–2:30 — Valuación y procedencia de Bedrock

Abra el mapa, seleccione un terreno y muestre el resumen. Los mosaicos del mapa requieren conexión a internet. La valuación local es una estimación. El panel indica si el resumen vino de Amazon Bedrock con el modelo configurado o si es una simulación local, junto con el motivo del fallback.

> “La capacidad y las proyecciones financieras son resultados ilustrativos del modelo de valuación local, no economía de proyecto verificada. Bedrock es opcional: el propio resumen indica si lo generó el modelo configurado o la simulación local.”

### 2:30–2:50 — Cierre

Cambie el idioma a inglés y vuelva al español. Evite afirmaciones cuantitativas de rendimiento o ahorro salvo que haya mediciones independientes que las respalden.

> “Kuarahy AX mantiene opcionales las integraciones de inferencia remota y hace visible el fallback local. El código y la documentación explican cómo configurar cada integración y qué mide —y qué no mide— esta demo.”
