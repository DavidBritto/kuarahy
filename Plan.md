# SolariA — plan de ejecución por etapas

**Categoría:** Energía Sustentable y Medio Ambiente
**Equipo:** Lisandro · David · Lautaro · Cain — carriles de archivos exclusivos
**Ventana:** 2 horas de reloj hasta la demo
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · SunCalc · Recharts

> **Cómo se lee este documento.** En el minuto 0 los cuatro leen **§0, §1 y §2** — son tres carillas. Después cada uno lee **solo su carril de §3** y el código de §4 que le corresponde. Nadie necesita leer el carril de otro.

### Quién hace qué

| | Carril | Archivos exclusivos |
|---|---|---|
| **Cain** | Motor solar y reglas | `lib/solar.ts`, `lib/recommend.ts` |
| **Lisandro** | Datos, API e integración · **dueño del deploy** | `lib/providers.ts`, `lib/normalize.ts`, `app/api/dashboard/route.ts`, `lib/fallback.json` |
| **Lautaro** | Dashboard, mock y tarjetas | `app/page.tsx`, `components/Dashboard.tsx`, `MetricCard.tsx`, `AdviceCard.tsx`, `AiBadge.tsx`, `app/globals.css`, `lib/mock.ts` |
| **David** | Visualizaciones y pitch | `components/SolarArc.tsx`, `ValidationChart.tsx`, `PowerChart.tsx`, `README.md`, slides, video |

**Los tres carriles que no son el de Lisandro son intercambiables** — las fronteras son de archivo, no de persona, así que se pueden permutar en diez segundos. Lo único que conviene fijar: **el motor (Cain) es el camino crítico** y hay que pushearlo temprano porque desbloquea al resto; y **el deploy y la integración van juntos en la misma persona** (Lisandro, que tiene el repo y la cuenta de Vercel).

Dos advertencias sobre el reparto, para que nadie se sorprenda a mitad de camino:

- **Lisandro tiene el carril más pesado.** El normalizador de Open-Meteo → `HourlyPoint[]` es lo que más código lleva de todo el proyecto, y además conduce la Etapa 3. Si a los 40 minutos va corto, el primero que se libera es Cain (el motor es pegar §4.2 y verificar) y le entra a `lib/normalize.ts`.
- **Con 4 personas, algo se cae.** `PowerChart.tsx` pasa a ser el objetivo elástico de David: si no llega, no llega. Se cortan las visualizaciones en ese orden y no en otro, porque `SolarArc` es must-have y `ValidationChart` es el pico del pitch.

---

## §0 · La regla de oro

En 2 horas con 4 personas **no entra todo**. Esto es lo que se defiende solo si absolutamente todo lo demás falla:

| # | Must-have | Dueño |
|---|---|---|
| 1 | Dashboard con **una** ubicación fija (Corrientes, −27.47 / −58.83) | Lautaro |
| 2 | Potencia ahora · kWh hoy · kWh con la mejor orientación fija · pérdida % | Cain + Lautaro |
| 3 | Arco solar en SVG con el panel dibujado | David |
| 4 | **Una** recomendación con número **y fórmula visible** | Cain (regla) + Lautaro (tarjeta) |
| 5 | Contador de IA frugal | Lautaro |
| 6 | Deployado y abriendo desde un celular ajeno | Lisandro |

Todo lo demás —selector de ciudades, heatmap, pronóstico de 7 días, calidad del aire, 3D— es **backlog (§7)**. Si a la **1:25** algo no compila, se comenta y se sigue. No se debuggea de más.

**La idea en una frase:** calculamos la posición del sol y la irradiancia real, las cruzamos con el pronóstico, y devolvemos *acciones concretas* — con casi todo el cómputo determinístico y sin modelos de IA, porque la IA hoy es parte del problema energético.

---

## §1 · Convenciones — esto no se negocia

**Este es el bug más caro que puede tener el proyecto y no tira ninguna excepción.** Hay tres convenciones de azimut dando vueltas y las tres se ven "razonables":

| Fuente | Convención |
|---|---|
| **La nuestra (interna)** | **0 = N · 90 = E · 180 = S · 270 = O**, en **grados** |
| SunCalc | 0 = **sur**, en **radianes**, creciendo hacia el oeste |
| Open-Meteo `global_tilted_irradiance` | 0 = **sur** · −90 = E · +90 = O · ±180 = N |

Si se mezclan, `cos(azSol − azPanel)` devuelve basura, la recomendación estrella apunta al lado contrario y **el arco solar se dibuja igual de lindo**.

**Reglas:**

1. Dentro de `lib/` y `components/` **solo existe la convención brújula**. Punto.
2. La conversión ocurre **únicamente** en el borde: al leer SunCalc y al armar la URL de Open-Meteo.
3. En Argentina el óptimo es **norte franco**. En nuestra convención es `0`. En Open-Meteo se escribe **`azimuth=180`**, no `azimuth=0`. Quien escriba `0` ahí está validando contra un panel mirando al sur.

```ts
export const norm360 = (d: number) => ((d % 360) + 360) % 360

/** SunCalc mide desde el SUR, en radianes, creciendo al oeste. */
export const suncalcToCompass = (rad: number) => norm360(rad * 180 / Math.PI + 180)

/** Open-Meteo GTI: 0 = S, −90 = E, +90 = O, ±180 = N.  NORTE FRANCO = 180. */
export const compassToOpenMeteo = (deg: number) => ((norm360(deg) - 180 + 540) % 360) - 180

/** Giro mínimo de `from` a `to`, en [−180, 180]. Positivo = hacia el ESTE. */
export const deltaAz = (from: number, to: number) => ((to - from + 540) % 360) - 180
```

**Prueba de humo (2 minutos, Cain la corre en la Etapa 2).** Corrientes, `2026-06-21T15:55Z` (mediodía solar del solsticio de invierno):

```
elevación ≈ 39°     azimut ≈ 0° (norte)
```

Si el azimut da **≈ 180°, la conversión está invertida.** Ese único assert hace verdadera la palabra "verificable" del pitch.

### El tiempo también tiene una sola convención

Open-Meteo con `timezone=auto` devuelve `"2026-08-01T15:00"` — **sin offset**. `new Date("2026-08-01T15:00")` lo interpreta en la zona del runtime: la notebook está en UTC−3 y **Vercel corre en UTC**. Anda en local y muestra el sol tres horas corrido en producción, descubierto durante la demo.

1. Pedimos siempre **`&timeformat=unixtime`** → epoch en segundos, GMT+0 (está en la doc de Open-Meteo, textual).
2. Adentro todo es **`ts: number` = epoch en milisegundos, UTC**. Nunca un string.
3. `utc_offset_seconds` se guarda en `meta` y se usa **solo para formatear** la hora en pantalla. Jamás para calcular.

---

## §2 · Etapas

| Etapa | Reloj | Quién | Salida |
|---|---|---|---|
| **0 · Cimientos** | 0:00–0:12 | Los 4 juntos | Proyecto, `types.ts`, **todas** las deps, repo, **deploy vacío andando** |
| **1 · Stubs + mock** | 0:12–0:20 | Los 4 | Cada archivo existe y **compila**. `lib/mock.ts` publicado. Nadie bloqueado |
| **2 · Paralelo** | 0:20–1:00 | 4 carriles | 40 min de código sin pisarse |
| **3 · Integración** | 1:00–1:25 | **Dueño: Lisandro** | Mock → datos reales, en 4 pasos |
| **4 · Endurecimiento** | 1:25–1:40 | Repartido | Fallback, mobile, estados, video |
| **5 · Pitch** | 1:40–2:00 | Los 4 | Dos pasadas con cronómetro |

### Etapa 0 · Cimientos (0:00–0:12) — los 4 en la misma pantalla

Tipea Lisandro, los otros tres miran y dictan. **Nadie codea antes de que el contrato esté pusheado.**

```bash
npx create-next-app@latest solaria --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
```

```bash
npm i suncalc recharts && npm i -D @types/suncalc
```

> Si `npm i recharts` se queja de peer deps con React 19, corré `npm i recharts --legacy-peer-deps` y **seguí**. No se debuggea el árbol de dependencias en una hackatón.

Después: pegar `lib/types.ts` completo (§4.1), `git init`, repo en GitHub, **importar en Vercel y deployar el esqueleto vacío ahora mismo**.

**Por qué el deploy va acá y no al final.** El primer deploy siempre rompe: versión de Node, un `any` que voltea el build, una env var. Descubrirlo a 25 minutos del pitch es el peor escenario posible. Deployando vacío en el minuto 12, cada push posterior es un deploy ya probado y el riesgo se reparte en gotas.

### Etapa 1 · Stubs + mock (0:12–0:20) — los 4

Cada uno crea **sus** archivos con las firmas de función y un `return` cualquiera que **tipa y compila**, y pushea. A partir de acá todos pueden importar de todos aunque nada esté implementado.

En paralelo, **Lautaro publica `lib/mock.ts`**: un `DashboardPayload` completo, hardcodeado, con ~14 puntos horarios plausibles. Es *el* artefacto que desbloquea a Lautaro y a David durante los siguientes 40 minutos. No es opcional y no es "lo hago después".

### Etapa 2 · Paralelo (0:20–1:00) — 4 carriles

Fronteras de archivo estrictas (§3). Commit cada 15 minutos. `git pull --rebase` antes de cada push.

### Etapa 3 · Integración (1:00–1:25) — dueño: Lisandro

Sin dueño nombrado, la integración se transforma en cuatro personas mirando el mismo error de tipos. **Lisandro conduce, los demás responden preguntas sobre su carril y no tocan el teclado.** Cuatro pasos, en orden, cada uno con criterio de corte:

| Paso | Qué | Si no sale en… |
|---|---|---|
| 1 | `/api/dashboard` devuelve un `DashboardPayload` real | 8 min → se sirve el mock desde la API y se sigue |
| 2 | El dashboard consume la API en vez de `MOCK` (una línea) | 4 min → vuelve al mock |
| 3 | La recomendación muestra un número calculado, no hardcodeado | 6 min → **este no se puede saltear, es el pitch** |
| 4 | El gráfico de validación superpone las dos curvas | 7 min → se comenta el componente |

### Etapa 4 · Endurecimiento (1:25–1:40)

- **Lisandro** — `lib/fallback.json` cargado y probado **con el wifi apagado**. No es opcional.
- **Lautaro** — abrir en un teléfono ajeno. Estados de carga y error (con wifi de hackatón, lo que va a ver el jurado es una pantalla en blanco de 8 segundos).
- **Cain** — que no haya `NaN`, `Infinity` ni sol dibujado de noche. Es su motor el que los produce.
- **David** — **video de 40 segundos de la demo andando**, como seguro contra el "no anda en vivo".

### Etapa 5 · Pitch (1:40–2:00)

Dos pasadas completas con cronómetro. Los cuatro tienen que saber responder *"¿de dónde sale ese número?"* — y ahora la respuesta es el gráfico de validación (§6).

---

## §3 · Los 4 carriles

### Cain · Motor solar y reglas

**Archivos exclusivos:** `lib/solar.ts`, `lib/recommend.ts`
**Depende de:** nada. **Bloquea a:** todos. Empezá por acá y pusheá temprano.

Los dos archivos van juntos porque `recommend.ts` importa `deltaAz` de `solar.ts`: mismas fórmulas, misma cabeza, cero coordinación entre personas.

**Primero `solar.ts`** (~20 min). Funciones puras: sin `fetch`, sin React, sin `Date.now()`, sin `new Date()` sin argumento. Se testea en Node en 5 segundos.

- `getSunPosition(coords, tsMs)` — SunCalc + conversión de §1
- `incidenceCos(sun, orientation)` — **con clamp**
- `poaIrradiance(...)` — cielo isotrópico, albedo 0.20
- `cellTemp` / `estimatePowerKw`
- `dayKwh(points, panel, orientation)`
- `optimalFixedOrientation(points, panel)` — fuerza bruta, devuelve el contador de evaluaciones

Código completo en **§4.2**. Está resuelto — es trabajo de pegar y verificar, no de derivar física a contrarreloj.

**Tres cosas que no se pueden saltear:**
- `Math.max(0, cosθ)` y `elevation > 0`. Sin eso el panel genera potencia negativa de tarde y sigue generando de noche. Es el primer bug que ve un juez.
- El difuso sale de `dhi`, que **ya viene en la query**. Nada de aproximarlo con `GHI × 0.15`: es un número mágico indefendible justo en el proyecto cuyo diferencial es mostrar la fórmula.
- `cellTemp` se alimenta con **POA**, no con GHI. El modelo NOCT pide la irradiancia en el plano del panel.

**Después `recommend.ts`** (~20 min). Son las reglas determinísticas que producen el número del pitch. Código en **§4.4**.

| Regla | Disparo | Salida |
|---|---|---|
| Desvío de orientación | `\|Δaz\| > 5°` o `\|Δtilt\| > 5°` | **el número del pitch** |
| Suciedad | `pm10 > 50` o `dust > 20` | limpieza — pérdida documentada 3–6 % |
| Temperatura | `temp > 35 °C` | caída por coeficiente térmico |
| Pico de generación | siempre | mover consumo a la franja 11:00–15:00 |

Devolvés `Recommendation[]`; **Lautaro las renderiza**. La frontera es el tipo: vos no tocás componentes, él no toca reglas.

**Dos trampas concretas:**
- `gain = (optimal − actual) / actual × 100` da **`Infinity` o `NaN`** de noche o con el panel muy desorientado — y ese es exactamente el número que va proyectado en pantalla. Guard: `actual > 0.05 kWh`.
- `dust` puede no venir. `undefined > 20` es `false` en silencio y la recomendación de limpieza **no se dispara nunca**. Por eso `AirQuality.dust` es `number` no opcional y se normaliza con `?? 0` del lado de Lisandro.

**Decir "orientación óptima" a secas es atacable.** Si se calcula el óptimo instantáneo, la ganancia sale enorme e irreal: eso es un tracker, no un panel fijo. Lo que comparamos es **la mejor orientación FIJA contra la orientación fija actual**, y el óptimo se busca sobre **todos los días del pronóstico**, no sobre uno solo. Que se lea así en la UI y se diga así en el pitch.

**Listo cuando:** la prueba de humo de §1 da elevación ≈ 39° y azimut ≈ 0°, y `buildRecommendations(MOCK)` devuelve al menos una recomendación con `gainPct` finito.

**Si terminás temprano** (es probable — §4.2 está escrito), no agarres otro componente: andá a ayudar a Lisandro con `lib/normalize.ts`. Es el archivo más largo del proyecto y es el que puede atrasar la integración.

---

### Lisandro · Datos, API e integración

**Archivos exclusivos:** `lib/providers.ts`, `lib/normalize.ts`, `app/api/dashboard/route.ts`, `lib/fallback.json`
**Depende de:** `types.ts` (Etapa 0) y las firmas de Cain (Etapa 1). **Dueño de la Etapa 3 y del deploy.**

**Es el carril más pesado del proyecto.** El normalizador —mapear los arrays paralelos de Open-Meteo a `HourlyPoint[]`, calcular posición solar punto por punto, POA, potencia y el óptimo— es lo que más código lleva. Si a los 40 minutos vas corto, pedile a Cain que agarre `lib/normalize.ts`: es la única transferencia de trabajo prevista en el plan.

Todas las APIs son gratuitas y **sin API key**.

Responsabilidades:
1. Query de Open-Meteo con `_instant` y `timeformat=unixtime` (**§4.3**).
2. Caché en `Map` con TTL de 15 min. **En Next.js 15 los Route Handlers GET no se cachean solos** — el cacheo pasó a opt-in explícito. `export const revalidate = 900` no hace lo que parece. El caché va a mano; no se pierden 20 minutos peleando con el caché de Next.
3. **`lib/fallback.json` — obligatorio.** Se genera con un `curl` (§4.3) y se sirve si el fetch falla. Esto salva la demo.
4. Normalizar todo a `HourlyPoint` antes de devolverlo. **Ningún componente ve el JSON crudo de Open-Meteo.**
5. Poblar `meta.source: 'live' | 'fallback'` — el badge "datos en vivo" del layout se apoya en ese campo.

**Por qué hay dos juegos de variables de radiación.** Open-Meteo devuelve por defecto el **promedio de la hora previa**. Cruzar la posición del sol a las 15:00 con radiación promediada entre 14:00 y 15:00 mete un corrimiento sistemático de media hora, peor cerca del amanecer y del atardecer — que es justo donde el ángulo de incidencia se vuelve extremo y donde vive la recomendación. Entonces:

- **`*_instant`** → el `now` y el arco solar.
- **promediados** (sin sufijo) → integrar los kWh del día. Ahí el promedio es lo correcto.

Ese matiz, además, es una respuesta excelente si un juez pregunta por precisión.

**Listo cuando:** `curl localhost:3000/api/dashboard` devuelve un `DashboardPayload` válido, y sigue devolviéndolo con el wifi apagado.

---

### Lautaro · Dashboard, mock y tarjetas

**Archivos exclusivos:** `app/page.tsx`, `components/Dashboard.tsx`, `components/MetricCard.tsx`, `components/AdviceCard.tsx`, `components/AiBadge.tsx`, `app/globals.css`, **`lib/mock.ts`**
**Depende de:** `types.ts`. **Trabaja contra `MOCK` desde el minuto 12.** En la Etapa 3 se cambia una línea.

**Entregable de la Etapa 1, antes que cualquier estilo: `lib/mock.ts`.** Un `DashboardPayload` completo y plausible, con ~14 puntos horarios. Desbloquea a David durante los siguientes 40 minutos — mientras no exista, él no puede hacer nada.

Sos el único que toca componentes de presentación. Cain produce los datos de las recomendaciones, vos los mostrás; la frontera entre ustedes es el tipo `Recommendation`, no un archivo compartido.

**Dirección visual — restricción tipo Starlink:**

| Elemento | Decisión |
|---|---|
| Fondo | Negro casi puro `#0A0A0B`, superficies `#141416` |
| Acento | Uno solo: ámbar solar `#F0A31A`. Nada más. |
| Estados | Verde `#3FB950` óptimo · ámbar ajustable · rojo `#E5534B` **solo** alertas reales |
| Tipografía | Una sola sans (Inter/Geist), pesos 400 y 500. Números 32–48 px con `tabular-nums` |
| Densidad | Mucho aire. Una métrica por tarjeta. |
| Bordes | Hairlines 1 px al 8 % de opacidad. Sin sombras, sin gradientes decorativos. |
| Movimiento | Solo transiciones de estado, 200 ms. Nada que rebote. |

Lo que hace que Starlink se vea como Starlink es la **restricción**. Si dudás entre agregar algo o no, no lo agregues.

**Mobile-first, no "responsive después".** El checklist pide que abra desde un celular ajeno y los jueces van a mirar en el teléfono. Se diseña la columna primero y la grilla entra recién en `md:`.

```
MOBILE (columna)                DESKTOP (md:)
┌────────────────────┐          ┌──────────────────────────────────────┐
│ ubicación · hora   │          │ ubicación · hora        [en vivo]    │
│ [en vivo]          │          ├──────────┬──────────┬────────────────┤
├────────────────────┤          │ potencia │ hoy kWh  │ pérdida %      │
│ potencia (grande)  │          ├──────────┴──────────┴────────────────┤
├────────────────────┤          │                                      │
│ hoy kWh            │          │          arco solar + panel          │
├────────────────────┤          │                                      │
│ pérdida %          │          ├──────────────────────────────────────┤
├────────────────────┤          │ ACCIÓN RECOMENDADA (+ fórmula)       │
│ arco solar         │          ├──────────────────┬───────────────────┤
├────────────────────┤          │ curva del día    │ validación        │
│ ACCIÓN (+ fórmula) │          ├──────────────────┴───────────────────┤
├────────────────────┤          │ badge IA frugal                      │
│ curva · validación │          └──────────────────────────────────────┘
├────────────────────┤
│ badge IA frugal    │
└────────────────────┘
```

**Las dos tarjetas que llevan el pitch:**

**`AdviceCard.tsx`** — renderiza un `Recommendation`. Título grande, cuerpo, y **la fórmula visible en monoespaciada** cuando `formula` viene. Esa línea de fórmula es literalmente el diferencial del proyecto: es lo que convierte "confiá en el 12 %" en "mirá de dónde sale".

**`AiBadge.tsx`** — el contador de IA frugal. Arranca marcando **cero**:

```
67.392 cálculos · 0 llamadas a IA · 0,00 Wh
                              [ Explicámelo en lenguaje natural ]
```

Al apretar el botón sube a `1 llamada · 0,24 Wh`. Ese es el momento de demo: la tesis se **demuestra en vivo** en lugar de afirmarse — el usuario decide gastar la energía.

Dos reglas para que los números del badge no sean decorativos:

- **`computations`** es el valor que devuelve `optimalFixedOrientation` (~67.000 con 3 días de pronóstico), **nunca uno escrito a mano**. Si cambia `forecast_days`, el número cambia solo.
- **`whEstimated` = `llmCalls × 0,24 Wh`**, que es el consumo **medido por Google** para un prompt de texto mediano en Gemini (paper de agosto 2025, arXiv 2508.15734). **La fuente va citada en pantalla, en chico, debajo del contador.** En el proyecto cuya tesis es la honestidad numérica, un número inventado acá se lleva puesta la credibilidad del resto — incluido el porcentaje de la recomendación.

El botón se muestra según `NEXT_PUBLIC_LLM_ENABLED` (§3 · David arma el endpoint si se prende). Con el flag apagado, el badge queda igual pero sin botón: sigue siendo un argumento completo.

**Listo cuando:** se ve completo con `MOCK`, en un teléfono, con estados de carga y error, y el badge marca `0 llamadas`.

---

### David · Visualizaciones y pitch

**Archivos exclusivos:** `components/SolarArc.tsx`, `components/ValidationChart.tsx`, `components/PowerChart.tsx`, `README.md`, slides, video
**Depende de:** `lib/mock.ts` (minuto 20). **Arrancá en 2D con SVG. El 3D es trampa de tiempo.**

**El orden importa y no es negociable:** `SolarArc` → `ValidationChart` → `PowerChart`. Los primeros dos son must-have (uno está en §0, el otro es el pico del pitch); **`PowerChart` es el objetivo elástico del proyecto**. Con 4 personas hay ~40 minutos para ~55 de trabajo, así que es probable que no llegue — y está bien, siempre que se caiga ese y no otro.

El README, las slides y el video son trabajo de las Etapas 4 y 5, cuando la construcción ya paró. No compiten con estos 40 minutos.

**1 · `SolarArc.tsx` — el gemelo digital (25 min).** `viewBox="0 0 400 220"`, horizonte en `y=200`.

- x lineal desde el amanecer hasta el atardecer, `y = 200 − (elevation / 90) × 180`
- trayectoria completa punteada, recorrido cumplido en línea sólida
- el sol como círculo ámbar en la posición actual
- el panel como rectángulo rotado según `tilt`, con una rosita de los vientos chica que marque el `azimuth`
- si `elevation <= 0`, el sol **no se dibuja**

**2 · `ValidationChart.tsx` — el momento más fuerte del pitch (15 min).** Superponer `poa` (nuestro motor) contra `gtiApi` (Open-Meteo), más el error medio como número grande.

Open-Meteo calcula su `global_tilted_irradiance` con **el mismo modelo que nosotros** — cielo isotrópico y albedo 20 %, está en su documentación. O sea: le pedimos a un proveedor meteorológico independiente el mismo número que calcula nuestro motor, y mostramos que se superponen.

Eso convierte *"confíen en nuestra fórmula"* en *"acá está nuestro motor contra un tercero independiente, error medio 3 %"*. Es la respuesta definitiva a la pregunta que los cuatro tienen que saber contestar.

```ts
// filtrar los valores chicos: cerca de cero el error relativo explota y no dice nada
const pts = points.filter(p => p.gtiApi !== null && p.gtiApi > 20)
const errorPct = pts.length === 0 ? 0
  : (pts.reduce((s, p) => s + Math.abs(p.poa - p.gtiApi!) / p.gtiApi!, 0) / pts.length) * 100
```

**3 · `PowerChart.tsx` — la pérdida, visualmente (15 min · elástico).** Recharts `AreaChart`, dos series: `powerKw` real vs `powerOptimalKw`. **El área entre las dos curvas *es* la pérdida.** Necesita `'use client'`. **Si el reloj aprieta, este es el que se cae.**

**Listo cuando:** `SolarArc` y `ValidationChart` renderizan con `MOCK` sin un solo warning en consola.

#### Etapas 4 y 5 — el pitch (después de que pare la construcción)

README, las 6 diapositivas de §6, el video de 40 segundos, y conducir los dos ensayos con cronómetro.

**Solo si sobra tiempo y todo lo demás está cerrado: la capa de lenguaje.** Va detrás de un flag y **apagada por defecto**:

```
NEXT_PUBLIC_LLM_ENABLED=false   # .env.local
```

Es **una** llamada, con los números **ya calculados**, solo para redactar. Nunca para calcular. Como no está claro si las reglas de la hackatón exigen usar IA, el flag cubre los dos escenarios sin rehacer nada — y con el flag apagado el badge de Lautaro sigue siendo un argumento completo.

> Prompt: *"Convertí estos hallazgos en 3 recomendaciones breves, en español rioplatense, cada una con la acción concreta y el beneficio numérico. No inventes ni recalcules ningún número."*

---

## §4 · Código

### §4.1 · `lib/types.ts` — el contrato

Se pega entero en la Etapa 0. **Después nadie lo toca sin avisar en voz alta.** Es lo único que evita que se pisen.

```ts
/** Azimut en convención BRÚJULA: 0 = N, 90 = E, 180 = S, 270 = O. Ver §1. */
export type CompassAzimuth = number

export interface Coords { lat: number; lon: number; label: string }

export interface PanelConfig {
  azimuth: CompassAzimuth
  tilt: number              // 0 = horizontal, 90 = vertical
  areaM2: number
  efficiency: number        // 0.20 = módulo del 20 %
  performanceRatio: number  // 0.85 — inversor, cableado, mismatch. Se cancela en el %
}

export interface SunPosition {
  ts: number                // epoch ms, UTC. NUNCA un string sin offset.
  elevation: number         // grados; negativo = de noche
  azimuth: CompassAzimuth
}

export interface HourlyPoint {
  ts: number                // epoch ms, UTC
  sun: SunPosition
  ghi: number               // W/m²
  dni: number
  dhi: number               // difuso horizontal — SE USA, no se aproxima
  poa: number               // irradiancia en el plano del panel (lo que calculamos)
  gtiApi: number | null     // el mismo POA según Open-Meteo → gráfico de validación
  cosIncidence: number      // ya clampeado a [0, 1]
  cloudCover: number        // 0-100
  temperature: number       // °C
  powerKw: number
  powerOptimalKw: number    // con la mejor orientación FIJA, no con seguimiento
}

export interface Orientation { azimuth: CompassAzimuth; tilt: number }

export interface DayForecast {
  date: string              // YYYY-MM-DD en hora local del sitio
  points: HourlyPoint[]
  totalKwh: number
  optimalKwh: number
  lossPct: number           // 0 si totalKwh ≈ 0. Nunca NaN, nunca Infinity
}

export interface Recommendation {
  id: string
  severity: 'info' | 'action' | 'urgent'
  title: string
  body: string
  formula?: string          // se muestra en pantalla: es el diferencial del proyecto
  gainPct?: number
  gainKwh?: number
}

export interface AirQuality {
  pm10: number; pm2_5: number; usAqi: number
  dust: number              // NO opcional: si falta, 0 (ver §3 · Cain)
}

export interface AiStats {
  computations: number      // evaluaciones reales del motor
  llmCalls: number
  whEstimated: number       // llmCalls × 0.24 Wh (Google, arXiv 2508.15734)
}

export interface Meta {
  source: 'live' | 'fallback'
  generatedAt: number
  utcOffsetSeconds: number  // SOLO para formatear. Nunca para calcular.
}

export interface DashboardPayload {
  meta: Meta
  coords: Coords
  panel: PanelConfig
  optimal: Orientation
  now: HourlyPoint
  today: DayForecast
  forecast: DayForecast[]
  air: AirQuality
  recommendations: Recommendation[]
  aiStats: AiStats
}
```

### §4.2 · `lib/solar.ts` — Cain

```ts
import SunCalc from 'suncalc'
import type { Coords, PanelConfig, SunPosition, Orientation } from './types'

const D2R = Math.PI / 180
const R2D = 180 / Math.PI

// ── Conversiones de azimut (§1) ────────────────────────────────────────────
export const norm360 = (d: number) => ((d % 360) + 360) % 360
export const suncalcToCompass = (rad: number) => norm360(rad * R2D + 180)
export const compassToOpenMeteo = (deg: number) => ((norm360(deg) - 180 + 540) % 360) - 180
/** Giro mínimo de `from` a `to`, en [−180, 180]. Positivo = hacia el ESTE. */
export const deltaAz = (from: number, to: number) => ((to - from + 540) % 360) - 180

// ── Posición solar ─────────────────────────────────────────────────────────
/** `tsMs` es epoch en ms (UTC). new Date(epoch) es inequívoco; un string sin
 *  offset no lo es — ver §1. */
export function getSunPosition(coords: Coords, tsMs: number): SunPosition {
  const { altitude, azimuth } = SunCalc.getPosition(new Date(tsMs), coords.lat, coords.lon)
  return { ts: tsMs, elevation: altitude * R2D, azimuth: suncalcToCompass(azimuth) }
}

// ── Geometría ──────────────────────────────────────────────────────────────
/** cos θ entre el rayo solar y la normal del panel, clampeado a [0, 1].
 *  Sin el clamp la potencia se va a negativo cuando el sol pega atrás. */
export function incidenceCos(sun: SunPosition, o: Orientation): number {
  if (sun.elevation <= 0) return 0
  const e = sun.elevation * D2R
  const t = o.tilt * D2R
  const d = (sun.azimuth - o.azimuth) * D2R
  const c = Math.sin(e) * Math.cos(t) + Math.cos(e) * Math.sin(t) * Math.cos(d)
  return Math.max(0, Math.min(1, c))
}

// ── Irradiancia en el plano del panel ──────────────────────────────────────
export const ALBEDO = 0.20

/** POA en W/m². Cielo isotrópico + albedo 0.20 — el MISMO modelo que usa
 *  Open-Meteo para su global_tilted_irradiance, así las curvas son comparables. */
export function poaIrradiance(
  r: { ghi: number; dni: number; dhi: number },
  cosIncidence: number,
  tiltDeg: number,
): number {
  const t = tiltDeg * D2R
  const beam    = r.dni * cosIncidence
  const diffuse = r.dhi * (1 + Math.cos(t)) / 2
  const ground  = r.ghi * ALBEDO * (1 - Math.cos(t)) / 2
  return Math.max(0, beam + diffuse + ground)
}

// ── Potencia ───────────────────────────────────────────────────────────────
const NOCT = 45          // °C
const TEMP_COEF = 0.004  // −0.4 %/°C, silicio cristalino

/** Modelo NOCT. Se alimenta con POA, no con GHI. */
export const cellTemp = (ambientC: number, poa: number) =>
  ambientC + ((NOCT - 20) / 800) * poa

export function estimatePowerKw(poa: number, ambientC: number, p: PanelConfig): number {
  const derate = Math.max(0, 1 - TEMP_COEF * (cellTemp(ambientC, poa) - 25))
  return Math.max(0, (poa * p.areaM2 * p.efficiency * p.performanceRatio * derate) / 1000)
}

// ── Integración y búsqueda del óptimo ──────────────────────────────────────
type RadPoint = { sun: SunPosition; ghi: number; dni: number; dhi: number; temperature: number }

/** kWh para una orientación dada. Rectángulos de 1 h. */
export function dayKwh(points: RadPoint[], panel: PanelConfig, o: Orientation): number {
  let kwh = 0
  for (const pt of points) {
    const poa = poaIrradiance(pt, incidenceCos(pt.sun, o), o.tilt)
    kwh += estimatePowerKw(poa, pt.temperature, panel)   // × 1 h
  }
  return kwh
}

/** Mejor orientación FIJA (no seguimiento): un solo par (az, tilt) para todo el
 *  período, que es lo comparable contra un panel fijo instalado.
 *  Fuerza bruta: 72 × 13 = 936 orientaciones. Sin optimizador, sin modelo. */
export function optimalFixedOrientation(points: RadPoint[], panel: PanelConfig) {
  let orientation: Orientation = { azimuth: panel.azimuth, tilt: panel.tilt }
  let kwh = -1
  let evaluations = 0
  for (let azimuth = 0; azimuth < 360; azimuth += 5) {
    for (let tilt = 0; tilt <= 60; tilt += 5) {
      const k = dayKwh(points, panel, { azimuth, tilt })
      evaluations += points.length
      if (k > kwh) { kwh = k; orientation = { azimuth, tilt } }
    }
  }
  return { orientation, kwh, evaluations }
}

/** Nunca NaN, nunca Infinity. Ver §3 · Cain. */
export const lossPct = (actual: number, optimal: number) =>
  actual > 0.05 ? Math.max(0, ((optimal - actual) / actual) * 100) : 0
```

**Prueba de humo** (`node --experimental-strip-types scripts/check-sun.ts`, o pegado temporalmente en una page):

```ts
const p = getSunPosition({ lat: -27.47, lon: -58.83, label: 'Corrientes' },
                         Date.parse('2026-06-21T15:55:00Z'))
console.log(p.elevation.toFixed(1), p.azimuth.toFixed(1))
// esperado ≈  39.0   0.0     ← si el azimut da ~180, la conversión está invertida
```

### §4.3 · `lib/providers.ts` — Lisandro

```ts
import { compassToOpenMeteo } from './solar'
import type { Coords, PanelConfig } from './types'

const HOURLY = [
  'temperature_2m', 'cloud_cover',
  // promediados sobre la hora previa → para INTEGRAR los kWh del día
  'shortwave_radiation', 'direct_normal_irradiance', 'diffuse_radiation',
  // instantáneos → para el AHORA y el arco solar (ver §3 · Lisandro)
  'shortwave_radiation_instant', 'direct_normal_irradiance_instant',
  'diffuse_radiation_instant', 'global_tilted_irradiance_instant',
].join(',')

export function forecastUrl(c: Coords, panel: PanelConfig): string {
  const q = new URLSearchParams({
    latitude: String(c.lat),
    longitude: String(c.lon),
    hourly: HOURLY,
    // OJO: acá va la convención de Open-Meteo (0 = SUR). Norte franco = 180.
    tilt: String(Math.round(panel.tilt)),
    azimuth: String(Math.round(compassToOpenMeteo(panel.azimuth))),
    timeformat: 'unixtime',  // epoch GMT+0. Sin esto el sol sale corrido en Vercel (§1)
    timezone: 'auto',        // solo para utc_offset_seconds y los cortes de día
    forecast_days: '3',
  })
  return `https://api.open-meteo.com/v1/forecast?${q}`
}

export const airUrl = (c: Coords) =>
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}` +
  `&longitude=${c.lon}&hourly=pm10,pm2_5,dust,us_aqi&timeformat=unixtime&timezone=auto&forecast_days=1`

// ── Caché a mano ───────────────────────────────────────────────────────────
// En Next.js 15 los Route Handlers GET NO se cachean por defecto: el cacheo
// pasó a opt-in explícito. `export const revalidate` no alcanza. Va acá.
const memo = new Map<string, { at: number; data: unknown }>()
const TTL = 15 * 60 * 1000

export async function cachedJson<T>(url: string): Promise<T> {
  const hit = memo.get(url)
  if (hit && Date.now() - hit.at < TTL) return hit.data as T
  const res = await fetch(url, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error(`${res.status} · ${url}`)
  const data = (await res.json()) as T
  memo.set(url, { at: Date.now(), data })
  return data
}
```

**Generar el fallback** (Etapa 2, un solo comando — `azimuth=180` es **norte**):

```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=-27.47&longitude=-58.83&hourly=temperature_2m,cloud_cover,shortwave_radiation,direct_normal_irradiance,diffuse_radiation,shortwave_radiation_instant,direct_normal_irradiance_instant,diffuse_radiation_instant,global_tilted_irradiance_instant&tilt=27&azimuth=180&timeformat=unixtime&timezone=auto&forecast_days=3" -o lib/fallback.json
```

El fallback tiene timestamps del momento en que se generó. **No los muevas**: se muestra `meta.source === 'fallback'` en la UI con la fecha de los datos. Es honesto, cuesta cero y responder *"sí, cuando se cae la API servimos el último dato bueno y lo decimos en pantalla"* es mejor que fingir que es de ahora.

### §4.4 · `lib/recommend.ts` — Cain

```ts
import { deltaAz } from './solar'
import type { DashboardPayload, Recommendation } from './types'

const MIN_KWH = 0.05  // guard de división: de noche o muy desorientado, actual ≈ 0

export function buildRecommendations(
  d: Omit<DashboardPayload, 'recommendations'>
): Recommendation[] {
  const out: Recommendation[] = []
  const { today, panel, optimal, air, now } = d

  // 1 · Desvío de orientación — ES EL NÚMERO DEL PITCH
  const dAz = deltaAz(panel.azimuth, optimal.azimuth)
  const dTilt = optimal.tilt - panel.tilt
  if ((Math.abs(dAz) > 5 || Math.abs(dTilt) > 5) && today.totalKwh > MIN_KWH) {
    const gainKwh = today.optimalKwh - today.totalKwh
    const gainPct = (gainKwh / today.totalKwh) * 100
    if (gainPct >= 1) {
      out.push({
        id: 'orientation',
        severity: 'action',
        title: `Girá el panel ${Math.abs(Math.round(dAz))}° al ${dAz > 0 ? 'este' : 'oeste'}`,
        body: `Pasá la inclinación de ${panel.tilt}° a ${optimal.tilt}°. ` +
              `Es la mejor orientación fija para estos días, y sumaría ` +
              `${gainPct.toFixed(1)} % (${gainKwh.toFixed(2)} kWh hoy).`,
        formula: 'cos θ = sin(elev)·cos(tilt) + cos(elev)·sin(tilt)·cos(Δaz)',
        gainPct, gainKwh,
      })
    }
  }

  // 2 · Suciedad por material particulado
  if (air.pm10 > 50 || air.dust > 20) {
    out.push({
      id: 'soiling', severity: 'action',
      title: 'Conviene limpiar los módulos',
      body: `PM10 en ${air.pm10.toFixed(0)} µg/m³. La suciedad acumulada cuesta ` +
            `entre 3 % y 6 % de generación (NREL).`,
    })
  }

  // 3 · Temperatura alta
  if (now.temperature > 35) {
    const drop = 0.4 * (now.temperature - 25)
    out.push({
      id: 'temp', severity: 'info',
      title: `Rendimiento ${drop.toFixed(0)} % abajo por temperatura`,
      body: `${now.temperature.toFixed(0)} °C ambiente. El silicio pierde 0,4 % por cada ` +
            `°C de celda sobre 25. Ventilar la parte de atrás ayuda.`,
      formula: 'P = P₀ · (1 − 0,004 · (T_celda − 25))',
    })
  }

  // 4 · Pico de generación → mover el consumo
  const peak = today.points.reduce((a, b) => (b.powerKw > a.powerKw ? b : a), today.points[0])
  if (peak && peak.powerKw > 0) {
    out.push({
      id: 'peak', severity: 'info',
      title: 'Movés el consumo pesado a la franja del mediodía',
      body: `El pico es a las ${new Date(peak.ts).getUTCHours()} h locales con ` +
            `${peak.powerKw.toFixed(2)} kW. Lavarropas, bomba y termotanque ahí ` +
            `salen de generación propia y no de la red.`,
    })
  }

  return out.slice(0, 3)
}
```

> El `getUTCHours()` del punto 4 hay que corregirlo con `meta.utcOffsetSeconds` para mostrar hora local — es la **única** vez que ese campo se usa (§1).

---

## §5 · Reglas de supervivencia

1. **Rama única `main`.** `git pull --rebase` antes de cada push. Commits cada 15 minutos.
2. **Todas las dependencias se instalan en la Etapa 0, y las instala Lisandro.** Después **nadie** corre `npm i <paquete>`. La frontera que se rompe siempre no es el código: es `package-lock.json`, y el conflicto llega en el peor momento. Si alguien necesita algo, lo pide en voz alta y lo instala Lisandro.
3. **Cada uno toca solo sus archivos** (tabla al inicio de §0). Si necesitás algo del carril de otro, se lo pedís; no lo editás. La única transferencia prevista es Cain → `lib/normalize.ts` si Lisandro va corto.
4. **`lib/types.ts` es de todos y de nadie.** Se escribe en la Etapa 0 y después solo se toca avisando en voz alta, porque un cambio ahí rompe los cuatro carriles a la vez.
5. **A la 1:25, lo que no compila se comenta.** No se debuggea de más.
6. **El video de 40 segundos se graba apenas la demo anda**, no al final.
7. **Deploy continuo desde el minuto 12.** Cada push que rompa el build se arregla en el momento, no se acumula.

---

## §6 · Pitch (3 minutos)

| # | Bloque | Tiempo | Habla | Qué se dice |
|---|---|---|---|---|
| 1 | **Problema** | 25 s | David | Un panel fijo mal orientado pierde entre 10 % y 25 % al año y el dueño no tiene cómo saberlo. Al mismo tiempo, la demanda energética de la IA crece. |
| 2 | **Solución** | 25 s | Lautaro | El dashboard, con datos reales de Corrientes, en vivo. |
| 3 | **La acción** | 35 s | Lautaro | *"El panel está 18° fuera de la mejor orientación fija. Ajustarlo sumaría 12 %."* Se muestra el número, la fórmula y los kWh. |
| 4 | **La validación** | 40 s | Cain | **El pico.** El gráfico con las dos curvas superpuestas: nuestro motor y Open-Meteo, un proveedor meteorológico independiente. Error medio 3 %. *"No les pedimos que nos crean: acá está el mismo número calculado por un tercero."* |
| 5 | **El diferencial** | 30 s | Cain | El badge, marcando **0 llamadas a IA**. *"La posición del sol se calcula con astronomía desde hace 400 años. Novecientas treinta y seis orientaciones evaluadas por fuerza bruta, en milisegundos. Cero llamadas a un modelo."* Si el botón del LLM llegó a existir, se aprieta acá y el contador sube a 1 · 0,24 Wh con la fuente citada. Si no llegó, **el bloque funciona igual** — el cero solo es más rotundo. |
| 6 | **Escalabilidad y cierre** | 25 s | Lisandro | Sensores Seeed / PowerTimer para pasar de estimación a medición. Extrapolación anual del ahorro. |

Quien habla del bloque 4 tiene que ser quien escribió el motor: si un juez repregunta sobre la validación, la respuesta tiene que salir sin dudar. Por eso Cain lleva los bloques 4 y 5.

**El cambio respecto de la versión anterior del guion:** el pico dejó de ser el "+12 %" y pasó a ser la validación. Un porcentaje afirmado es una promesa; un porcentaje confirmado por un tercero independiente es evidencia. Y desarma de antemano la única pregunta que puede voltear el pitch.

### Preguntas difíciles, respuestas preparadas

| Pregunta | Respuesta |
|---|---|
| ¿De dónde sale ese 12 %? | Del coseno del ángulo de incidencia, con el modelo de cielo isotrópico. La fórmula está en pantalla y la curva está validada contra Open-Meteo. |
| No hay hardware, es simulación | Correcto. El MVP valida el motor de cálculo y la capa de recomendación. La interfaz de datos para sensores ya está diseñada: es la etapa 2. |
| Un tracker físico ya resuelve esto | Un tracker mecánico cuesta y falla. Esto sirve para el parque instalado hoy, que es fijo — y para decidir si conviene invertir en el tracker. |
| ¿Y si se cae la API en la demo? | Hay fallback cacheado. Lo podemos mostrar ahora: *(apagar el wifi)*. |
| ¿Ustedes recalculan la orientación todos los días? | No, eso sería un tracker manual. Buscamos la mejor orientación **fija** sobre el pronóstico completo y la comparamos con la fija actual. |
| Ya existen productos así | Caros, cerrados y pensados para parques industriales. El diferencial es la accesibilidad y el bajo cómputo. |
| ¿Qué tan precisa es la irradiancia? | Es un modelo de cielo claro corregido por nubosidad, no una medición — está declarado como estimación en la UI. Y usamos los valores instantáneos, no los promedios horarios, justo para no arrastrar medio hora de error en los extremos del día. |

---

## §7 · Backlog

Solo si **todo** el §0 está cerrado y deployado.

| # | Qué | Tiempo | Riesgo |
|---|---|---|---|
| 1 | Calidad del aire → recomendación de limpieza | 10 min | bajo (la API ya está) |
| 2 | Comparativa vs. red convencional en kg de CO₂ | 15 min | bajo |
| 3 | Pronóstico de 7 días (`forecast_days=7`) | 10 min | bajo |
| 4 | **Calculadora de tracker** — fijo-óptimo vs. seguimiento en 1 eje, × tarifa, ÷ costo del tracker = repago en años | 20 min | bajo, **alto valor** — convierte una objeción del jurado en una feature |
| 5 | Buscador de ciudades (`geocoding-api.open-meteo.com`) | 20 min | medio |
| 6 | Heatmap horario (grilla de divs, `background-color` interpolado) | 25 min | medio |
| 7 | Proyección a 12 meses por promedio estacional | 25 min | medio |
| 8 | Panel 3D con react-three-fiber | 45 min | **alto — no** |

---

## §8 · Checklist antes de presentar

**Producto**
- [ ] Deployado y abre desde un celular **ajeno**
- [ ] El fallback funciona **con el wifi apagado** (probado, no supuesto)
- [ ] Hay estados de carga y de error — nunca una pantalla en blanco
- [ ] El badge dice `en vivo` o `cacheado` según `meta.source`

**Números**
- [ ] La recomendación principal muestra un número calculado y **no hardcodeado**
- [ ] No aparece `NaN` ni `Infinity` en ninguna pantalla, tampoco de noche
- [ ] El sol **no** se dibuja cuando `elevation <= 0`
- [ ] La prueba de humo de §1 pasa: elevación ≈ 39°, azimut ≈ 0°
- [ ] Las curvas del gráfico de validación se superponen dentro de ~5 %
- [ ] El contador de IA frugal está visible, arranca en 0 y **cita la fuente del 0,24 Wh**

**Respaldo**
- [ ] Video de 40 s de la demo andando
- [ ] README explica cómo correrlo en local
- [ ] Los 4 saben responder *"¿de dónde sale ese 12 %?"* — y apuntan al gráfico de validación

---

## Apéndice · Qué cambió respecto del plan original

Para quien ya había leído la versión anterior.

**Errores que producían números incorrectos sin fallar visiblemente:**

| | Antes | Ahora |
|---|---|---|
| Azimut | Tres convenciones mezcladas (`PanelConfig` 0=N, SunCalc desde el sur, Open-Meteo desde el sur), sin conversión | Una convención interna, conversión solo en los bordes, prueba de humo (§1) |
| Tiempo | `timezone=auto` → strings sin offset → `new Date()` los lee en la zona del runtime; anda en la notebook y falla en Vercel | `timeformat=unixtime` (GMT+0), `ts: number` en todo el contrato |
| Radiación | Valores promediados de la hora previa cruzados con la posición solar instantánea → medio hora de corrimiento | Variantes `_instant` para el ahora, promediadas para integrar |
| Difuso | `GHI × 0.15`, número mágico, con `diffuse_radiation` ya en la query | Cielo isotrópico + albedo 0.20 — el mismo modelo que Open-Meteo |
| Clamps | Sin `max(0, cosθ)` ni chequeo de elevación → potencia negativa y generación nocturna | Clampeado en `incidenceCos` |
| División | `(optimal − actual) / actual` → `Infinity`/`NaN` justo en el número del pitch | Guard `actual > 0.05 kWh` |
| `dust` | `dust?: number` comparado con `> 20` → no dispara nunca | `dust: number`, normalizado con `?? 0` |
| `Tcelda` | Alimentada con GHI | Alimentada con POA, como pide el modelo NOCT |

**Proceso:**

| | Antes | Ahora |
|---|---|---|
| Caché | `export const revalidate = 900` — en Next 15 los GET no se cachean solos | `Map` con TTL + `next: { revalidate }` en el `fetch` |
| Deploy | A la 1:35, con 25 min de margen | Esqueleto vacío al minuto 12 |
| Dependencias | `npm i` libre → conflicto de lockfile garantizado | Todo se instala en la Etapa 0, por una persona |
| Integración | "pasa" a la 1:15 | Dueño nombrado (Lisandro), 4 pasos con criterio de corte |
| Mock | Mencionado al pasar | Entregable de la Etapa 1, con dueño |

**Agregados:**

- **Gráfico de validación contra Open-Meteo** (§3 · David) — la mejora más grande. Convierte el pitch de una afirmación en evidencia.
- **Contador de cálculos real** — las evaluaciones que devuelve el motor (~67.000 con 3 días), no un número decorativo escrito a mano.
- **0,24 Wh con fuente citada** en vez de un "~0,4 Wh" inventado.
- **LLM detrás de un flag, apagado por defecto** — el badge arranca en cero y el usuario decide gastar la energía. Cubre los dos escenarios de reglas de la hackatón.
- **"Mejor orientación fija"** explícito, sobre todo el pronóstico — cierra la pregunta del tracker manual.
- **Mobile-first**, porque los jueces miran en el teléfono.
- **Alcance recortado** a un MVP defendible, con el resto en backlog honesto.
