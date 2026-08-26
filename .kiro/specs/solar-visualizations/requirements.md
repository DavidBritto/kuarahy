# Requirements Document

## Introduction

Este documento deriva los requisitos formales de los tres componentes de visualización del carril de David en **Kuarahy**: `SolarArc.tsx`, `ValidationChart.tsx` y `PowerChart.tsx`. Los requisitos se derivan del diseño técnico (`design.md`) ya definido y del contrato de tipos compartido (`lib/types.ts`, §4.1 del Plan del equipo).

Los tres componentes son de presentación pura: reciben props ya normalizadas (`HourlyPoint[]`, `HourlyPoint`, `PanelConfig`) desde `components/Dashboard.tsx` y no acceden directamente a APIs externas ni al normalizador. El orden de prioridad de implementación es `SolarArc` (must-have) → `ValidationChart` (pico del pitch, must-have) → `PowerChart` (objetivo elástico).

## Glossary

- **`HourlyPoint`**: punto horario normalizado del pronóstico, definido en `lib/types.ts` (§4.1 del Plan), con posición solar, irradiancia, potencia y temperatura.
- **`PanelConfig`**: configuración física del panel instalado (azimut, tilt, área, eficiencia, performance ratio).
- **Convención brújula**: convención de azimut interna del proyecto — 0=Norte, 90=Este, 180=Sur, 270=Oeste, en grados.
- **`poa`**: irradiancia en el plano del panel (Plane Of Array), calculada por el motor propio (`lib/solar.ts`).
- **`gtiApi`**: el mismo valor de irradiancia en el plano del panel, según Open-Meteo (`global_tilted_irradiance`), usado como validación independiente.
- **`DashboardPayload`**: el contrato de datos completo que consume `Dashboard.tsx` y del cual se derivan las props de los tres componentes de este carril.

## Requirements

### Requirement 1: `SolarArc.tsx` — gemelo digital del arco solar

**User Story:** Como jurado/usuario del dashboard, quiero ver la posición del sol y la orientación del panel representadas visualmente, para poder verificar de un vistazo si el panel está bien orientado en el momento actual.

#### Acceptance Criteria

1.1. CUANDO se renderiza `SolarArc` con un arreglo `points: HourlyPoint[]` no vacío, EL SISTEMA DEBERÁ dibujar la trayectoria solar completa del día como un trazo punteado dentro de `viewBox="0 0 400 220"`, con el horizonte en `y=200`.

1.2. CUANDO se renderiza `SolarArc`, EL SISTEMA DEBERÁ dibujar en trazo sólido únicamente el tramo de la trayectoria correspondiente a los puntos con `ts <= now.ts` (recorrido ya cumplido).

1.3. SI `now.sun.elevation > 0` Y es un valor finito, ENTONCES EL SISTEMA DEBERÁ dibujar un círculo ámbar representando al sol en la posición correspondiente a `now.sun.elevation` y `now.sun.azimuth`.

1.4. SI `now.sun.elevation <= 0`, ENTONCES EL SISTEMA NO DEBERÁ dibujar ningún elemento visual representando al sol.

1.5. CUANDO se renderiza `SolarArc`, EL SISTEMA DEBERÁ dibujar el panel como un rectángulo rotado según `panel.tilt`, junto con un marcador de rosa de los vientos que indique `panel.azimuth` en convención brújula (0=N, 90=E, 180=S, 270=O).

1.6. EL SISTEMA NUNCA DEBERÁ asignar un valor `NaN` o `Infinity` a un atributo SVG (`d`, `cx`, `cy`, `transform`, u otro) del componente `SolarArc`, para cualquier `points`, `now` y `panel` recibidos como props.

1.7. CUANDO `points` es un arreglo vacío, EL SISTEMA DEBERÁ renderizar `SolarArc` sin lanzar excepciones, mostrando únicamente el horizonte y el panel.

1.8. EL SISTEMA DEBERÁ interpretar `panel.azimuth` y `now.sun.azimuth` siempre en convención brújula (0=N, 90=E, 180=S, 270=O) dentro de `SolarArc`, sin aplicar ninguna conversión adicional (la conversión ya ocurrió antes de llegar a `components/`).

### Requirement 2: `ValidationChart.tsx` — validación contra Open-Meteo

**User Story:** Como jurado/usuario del dashboard, quiero ver superpuesta la irradiancia calculada por el motor propio contra la de un proveedor independiente (Open-Meteo), para poder confiar en que el número de generación reportado no está inventado.

#### Acceptance Criteria

2.1. CUANDO se renderiza `ValidationChart` con `points: HourlyPoint[]`, EL SISTEMA DEBERÁ graficar dos series sobre el mismo eje temporal: `poa` (motor propio) y `gtiApi` (Open-Meteo).

2.2. EL SISTEMA DEBERÁ excluir del cálculo del error medio porcentual todo punto donde `gtiApi === null` o `gtiApi <= 20`.

2.3. CUANDO existe al menos un punto con `gtiApi > 20`, EL SISTEMA DEBERÁ calcular y mostrar el error medio porcentual como un número grande, calculado como el promedio de `|poa - gtiApi| / gtiApi × 100` sobre los puntos válidos.

2.4. SI ningún punto cumple `gtiApi > 20` (todos nulos o descartados), ENTONCES EL SISTEMA DEBERÁ mostrar el error medio como `0%`.

2.5. EL SISTEMA NUNCA DEBERÁ mostrar `NaN` o `Infinity` como valor del error medio porcentual, para cualquier `points` recibido como prop.

2.6. CUANDO `points` es un arreglo vacío, EL SISTEMA DEBERÁ renderizar `ValidationChart` sin lanzar excepciones, mostrando un gráfico sin series y un error medio de `0%`.

### Requirement 3: `PowerChart.tsx` — visualización de la pérdida (elástico)

**User Story:** Como jurado/usuario del dashboard, quiero ver visualmente el área de energía perdida por la orientación actual del panel comparada con la orientación óptima fija, para entender el impacto sin leer números.

#### Acceptance Criteria

3.1. CUANDO se renderiza `PowerChart` con `points: HourlyPoint[]`, EL SISTEMA DEBERÁ graficar dos áreas superpuestas usando Recharts `AreaChart`: `powerKw` (potencia real) y `powerOptimalKw` (potencia con la mejor orientación fija).

3.2. EL SISTEMA DEBERÁ marcar el componente `PowerChart` con la directiva `'use client'`, dado que Recharts requiere ejecución en el cliente.

3.3. EL SISTEMA NUNCA DEBERÁ asignar un valor `NaN` o `Infinity` a una serie de datos pasada a Recharts dentro de `PowerChart`, para cualquier `points` recibido como prop.

3.4. CUANDO `points` es un arreglo vacío, EL SISTEMA DEBERÁ renderizar `PowerChart` sin lanzar excepciones, pasando un arreglo vacío `[]` a Recharts (nunca `undefined`).

3.5. SI el tiempo de desarrollo no permite completar `PowerChart`, ENTONCES EL SISTEMA DEBERÁ permitir que el componente quede comentado en `Dashboard.tsx` sin afectar el renderizado de `SolarArc` ni `ValidationChart`.

### Requirement 4: Contrato de props y frontera de tipos

**User Story:** Como desarrollador del carril de visualizaciones, quiero que mis componentes dependan únicamente de tipos ya definidos en `lib/types.ts`, para poder trabajar en paralelo con el resto del equipo sin bloquearme ni bloquearlos.

#### Acceptance Criteria

4.1. LOS componentes `SolarArc`, `ValidationChart` y `PowerChart` DEBERÁN recibir sus datos exclusivamente como props tipadas derivadas de `DashboardPayload` (`lib/types.ts`), sin definir tipos de datos nuevos ni duplicados.

4.2. NINGUNO de los tres componentes DEBERÁ realizar `fetch`, importar `lib/providers.ts`, `lib/normalize.ts` o `app/api/dashboard/route.ts`, ni leer variables de entorno.

4.3. CUANDO el origen de los datos cambia de `lib/mock.ts` a la API real (o al fallback), Y el shape de `HourlyPoint[]` recibido es idéntico, ENTONCES LOS tres componentes DEBERÁN producir el mismo tipo de salida visual sin cambios de código ni de comportamiento.

4.4. NINGUNO de los tres componentes DEBERÁ leer el campo `meta.source` del payload para decidir su comportamiento visual.

### Requirement 5: Convenciones no negociables del proyecto

**User Story:** Como equipo de Kuarahy, queremos que las reglas de convención críticas del §1 del Plan (azimut, elevación, ausencia de NaN/Infinity) se respeten estrictamente dentro de `components/`, para evitar el bug más caro del proyecto: una recomendación o dibujo que apunta al lado equivocado sin lanzar ninguna excepción.

#### Acceptance Criteria

5.1. DENTRO de `components/SolarArc.tsx`, `components/ValidationChart.tsx` y `components/PowerChart.tsx`, todo valor de azimut DEBERÁ interpretarse en convención brújula (0=N, 90=E, 180=S, 270=O) y EL SISTEMA NUNCA DEBERÁ aplicar una conversión de azimut adicional (SunCalc u Open-Meteo) dentro de estos archivos.

5.2. EL SISTEMA NUNCA DEBERÁ mostrar `NaN` ni `Infinity` en pantalla en ninguno de los tres componentes, para ningún valor de entrada de `HourlyPoint[]`, `HourlyPoint` o `PanelConfig`, incluyendo entradas con campos numéricos no finitos.

5.3. SI la elevación solar (`elevation`) es menor o igual a `0`, ENTONCES EL SISTEMA NO DEBERÁ dibujar el sol en `SolarArc`, sin excepción y sin importar el valor de `azimuth`.

5.4. CUANDO cualquiera de los tres componentes recibe un `HourlyPoint[]` vacío o con campos numéricos no finitos (`NaN`, `Infinity`, `null` donde no se espera), EL SISTEMA DEBERÁ sanear esos valores antes de pasarlos a un atributo SVG o a una serie de Recharts, y DEBERÁ seguir renderizando el resto de los datos válidos sin lanzar excepciones.
