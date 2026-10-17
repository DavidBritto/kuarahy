# Kuarahy AX — 3-Minute Hackathon Demo Video Script

> **Hackathon:** AWS Agent Experience Hackathon: Strands Decider  
> **Duration Target:** 2 minutes 50 seconds (< 3:00 hard limit)  
> **Resolution:** 1080p (1920x1080) at 60 FPS  
> **App URL:** `http://localhost:3000` (Language toggle set to `EN`)  
> **Repository:** [https://github.com/DavidBritto/kuarahy](https://github.com/DavidBritto/kuarahy)  
> **Required Tags:** `#strands-decider-2b` · `#tool-selection`  

---

## Pre-Recording Checklist

1. **Browser Setup:**
   * Open Chrome/Brave in Fullscreen (`F11`).
   * Zoom level: 100% or 110% (so typography is razor-sharp).
   * Ensure language toggle is on `[EN]` (English default).
   * Close devtools and hide bookmarks bar (`Ctrl+Shift+B`).
2. **Audio Setup:**
   * Microphone input level: -6dB peak, crisp voiceover with noise suppression.
3. **Recording Software:**
   * OBS Studio / Loom set to 1920x1080 @ 60fps.
   * Enable mouse click visual halos/highlights.

---

## Video Timeline & Storyboard (180 Seconds)

```
0:00 ─── 0:25 │ Hook & The Frugal Problem (30% cosine loss + 15% soiling)
0:25 ─── 1:15 │ HERO FEATURE: Digital Twin, Mechatronic Tracking & 65° Rainwash
1:15 ─── 1:50 │ THE REUSABLE ASSET: #tool-selection & Werner Vogels Benchmark
1:50 ─── 2:30 │ SECONDARY FEATURE: MapLibre GL Heatmap & Amazon Bedrock Synthesis
2:30 ─── 2:50 │ Conclusion & Impact: Edge SLM + Generative LLM
```

---

## Detailed Scene-by-Scene Script

### Scene 1: The Problem & The Frugal Architect Thesis (0:00 – 0:25)

* **Visual on Screen:**
  * Open directly on the Kuarahy AX dashboard (`http://localhost:3000`).
  * Hover gently over the banner: *"Hero Feature: Energy Gain & Autonomous Mechatronic Rainwash"*.
  * Mouse points to the KPI metric cards showing `+24.8% Mechatronic Advantage` and `14 ms Decider 2B Latency`.
* **Voiceover (English):**
  > *"Solar photovoltaic energy powers our clean future—yet static solar panels suffer from a massive double penalty. They lose up to 30% of energy because they don't track the sun, and another 15% to dust and dirt, forcing solar farms to spend thousands of dollars on manual wash crews with water trucks.*
  > *Why not use AI? Because in high-speed mechatronics, a motor gearbox cannot wait 2 seconds for a cloud LLM to respond, nor burn 0.24 Watt-hours per decision. Following Werner Vogels' 'The Frugal Architect', we built Kuarahy AX—using AWS Strands Decider 2B right at the edge."*

---

### Scene 2: Hero Feature Live Demo — Digital Twin & Rainwash (0:25 – 1:15)

* **Visual on Screen:**
  * **Action 1 (0:25):** Focus on the Digital Twin (`SolarArc.tsx`). Drag the Solar Hour slider from `07:00` to `12:00` to `16:00`.
  * Point cursor to the rotating photovoltaic panel and the normal ray vector tracking the sun in real time.
  * Point cursor to the top right badge: `Tilt Motor: 28°`, `ACTIVE_TRACKING`, and `14 ms` P95 latency.
  * **Action 2 (0:45):** Click the preset button: `🌧️ Self-Cleaning` (`rainwashPreset`).
  * Watch the Digital Twin immediately tilt to a steep **65°**, blue rain droplets stream across the SVG canvas, and the callout box illuminate:
    *"Active Rainwash Mode: 65° tilt leverages natural rainfall to wash away 8.5% soiling. Projected savings of $1,850 USD/year in eliminated manual wash crews."*
  * **Action 3 (1:00):** Click the preset button: `🌪️ Wind Gust` (`stormDefensePreset`).
  * Watch the panel immediately snap to flat **0° stow defense** in 14ms with the red alert badge.
* **Voiceover (English):**
  > *"Here is Kuarahy AX in action. In our Digital Twin, AWS Strands Decider 2B evaluates solar elevation and irradiance in under 15 milliseconds, continuously commanding motor micro-adjustments for a +24.8% net generation surplus.*
  > *Now watch what happens when precipitation is detected. With one click, Decider 2B evaluates rainfall and panel dust, immediately commanding a steep 65-degree tilt. Natural rainwater washes away accumulated dirt at high velocity—saving $1,850 dollars a year in manual cleaning labor!*
  > *And when 74 km/h gale winds hit? The system snaps the panel flat to 0 degrees in 14 milliseconds, protecting millions in capital equipment."*

---

### Scene 3: The Reusable Asset — `#tool-selection` with Strands Decider 2B (1:15 – 1:50)

* **Visual on Screen:**
  * Scroll down slightly to show the **Frugal Architecture Benchmark Table**.
  * Highlight the numbers:
    * Decision Latency: `14 ms` vs. `~1,850 ms` (16x faster).
    * Energy Consumption: `~0.00008 Wh` vs. `~0.24 Wh` (3,000x more energy-efficient).
  * Briefly tab over to VS Code or GitHub showing `lib/agent/decider-tool-selection.ts` and `REUSABLE_DECIDER_PATTERN.md`.
  * Highlight the class `DeciderToolSelector` and method `asStrandsInterventionHandler()`.
* **Voiceover (English):**
  > *"To empower the entire community, we packaged this decision engine into an open-source, reusable asset tagged with #tool-selection.*
  > *Our `DeciderToolSelector` provides strongly-typed state extraction and a drop-in adapter for AWS Strands agents. Look at our benchmark: Decider 2B runs 16 times faster and is 3,000 times more energy-efficient than frontier 70B cloud models. It delivers deterministic physical safety with near-zero power draw."*

---

### Scene 4: Secondary Feature & Generative Tier — MapLibre GL & Bedrock (1:50 – 2:30)

* **Visual on Screen:**
  * Click on the second tab: `🗺️ Prospecting Heatmap`.
  * The GPU-accelerated **MapLibre GL** map appears with the solar irradiance layer.
  * Click on a rural land parcel in Córdoba / Corrientes.
  * In the floating toolbar, switch the area buttons: `10 ha` ➔ `50 ha` ➔ `100 ha`.
  * Show the floating HUD card updating live: `Installed Capacity: 50.0 MWp`, `Turnkey CapEx: $42.50M`, `10-Year Return: +$78.20M USD`.
  * Click the glowing button: `View Amazon Bedrock Executive Proposal →`.
  * The modal opens displaying the Claude 3.5 Sonnet investment memorandum, key highlights, and Werner Vogels frugality breakdown.
* **Voiceover (English):**
  > *"For scaling solar farms, Kuarahy AX includes a secondary feature: GPU-accelerated prospecting with MapLibre GL. Developers can select rural parcels, toggle topologies from single-axis trackers to agrivoltaics, and simulate 10-year financial returns.*
  > *When executive committees need a formal prospectus, we invoke Amazon Bedrock with Claude 3.5 Sonnet on-demand. This preserves the core Frugal Architect rule: Small Language Models handle high-frequency edge automation; Generative Foundation Models handle high-level business intelligence."*

---

### Scene 5: Conclusion & Bilingual Showcase (2:30 – 2:50)

* **Visual on Screen:**
  * Close the modal and return to the main dashboard.
  * Click the `[EN | ES]` language toggle button in the header—watch the entire interface translate seamlessly to Spanish and back to English.
  * Hover over the GitHub repo link and final rubric tags.
* **Voiceover (English):**
  > *"With full bilingual internationalization, 24 out of 24 unit tests passing, and a production-grade digital twin, Kuarahy AX bridges physical robotics and agentic intelligence.*
  > *Check out our open-source codebase on GitHub tagged with #strands-decider-2b and #tool-selection.*
  > *Thank you for watching!"*

---

## Script Translation: Spanish Voiceover Alternative (Guión en Español)

Si prefieres grabar la locución en español o incluir subtítulos sincronizados:

> **(0:00 – 0:25) Introducción:**  
> *"La energía solar fotovoltaica lidera la transición limpia, pero los paneles fijos sufren dos grandes penalidades: pierden hasta 30% de energía por no seguir al sol, y hasta 15% adicional por polvo acumulado, obligando a contratar cuadrillas de lavado manual con camiones cisterna.*  
> *¿Por qué no usar IA? Porque en mecatrónica industrial un motor no puede esperar 2 segundos a que responda un LLM en la nube ni quemar 0.24 Wh por ciclo de control. Siguiendo la filosofía 'The Frugal Architect' de Werner Vogels, creamos Kuarahy AX utilizando AWS Strands Decider 2B en el borde."*

> **(0:25 – 1:15) Demostración del Gemelo Digital:**  
> *"En nuestro gemelo digital, Strands Decider 2B evalúa elevación solar e irradiancia en menos de 15 milisegundos, comandando microajustes que generan +24.8% de energía neta excedente.*  
> *Miren lo que ocurre ante lluvia: Decider 2B detecta precipitación y suciedad acumulada, inclinando automáticamente los paneles a 65 grados. El agua de lluvia natural limpia el vidrio a alta velocidad, ahorrando $1.850 dólares al año en cuadrillas manuales.*  
> *¿Y ante vientos de 74 km/h? El sistema repliega los paneles a 0 grados en 14 milisegundos para evitar daños estructurales."*

> **(1:15 – 1:50) Activo Reutilizable:**  
> *"Empaquetamos este motor de decisión como un activo reutilizable bajo el tag #tool-selection. Nuestro DeciderToolSelector se integra sin fricción en agentes de AWS Strands. En nuestro benchmark, Decider 2B es 16 veces más rápido y 3.000 veces más eficiente energéticamente que los modelos de 70 mil millones de parámetros."*

> **(1:50 – 2:30) Prospección con MapLibre GL y Bedrock:**  
> *"Como feature secundaria, integramos prospección territorial con MapLibre GL sobre GPU. Calculamos potencia instalable, CapEx y retorno a 10 años en cualquier terreno rural.*  
> *Y cuando se requiere una propuesta para comités de inversión, invocamos Amazon Bedrock con Claude 3.5 Sonnet bajo demanda: SLMs para control físico de alta frecuencia; LLMs para síntesis ejecutiva de negocio."*

> **(2:30 – 2:50) Cierre:**  
> *"Con soporte bilingüe instantáneo y 24 tests unitarios aprobados, Kuarahy AX une robótica física e inteligencia agéntica. Código libre en GitHub bajo los tags #strands-decider-2b y #tool-selection. ¡Muchas gracias!"*

---

## Recording Tips for Maximum Scoring

1. **Keep the pace brisk:** Do not pause for more than 1 second between sentences.
2. **Smooth Cursor Motion:** Move the mouse deliberately; avoid shaking or clicking erratically.
3. **Show the 14ms Badge:** When triggering presets, let the cursor hover over `14 ms` so the judges clearly see the ultra-low latency.
4. **Volume Normalization:** Normalize the final audio to -14 LUFS (YouTube/Loom standard).
