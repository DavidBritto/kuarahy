export type Locale = 'en' | 'es'

export interface I18nContent {
  header: {
    title: string
    deciderBadge: string
    activeMechatronicsBadge: string
    subtitlePrefix: string
    frugalQuote: string
  }
  tabs: {
    mechatronics: string
    prospecting: string
    primaryBadge: string
    secondaryBadge: string
  }
  banner: {
    featureTitle: string
    featureDesc: string
    durationLabel: string
  }
  kpi: {
    mechatronicAdvantage: {
      title: string
      comparison: string
      statusTag: string
    }
    netActivePower: {
      title: string
      comparison: string
      statusTagPrefix: string
    }
    deciderLatency: {
      title: string
      comparison: string
      statusTag: string
    }
    crewSavings: {
      title: string
      activeComparison: string
      idleComparison: string
      statusTag: string
    }
  }
  twin: {
    title: string
    subtitle: string
    motorTilt: string
    evaluating: string
    solarHour: string
    elevation: string
    directGti: string
    sunrise: string
    solarNoon: string
    sunset: string
    presetsLabel: string
    presets: {
      trackingTitle: string
      trackingDesc: string
      rainwashTitle: string
      rainwashDesc: string
      stormTitle: string
      stormDesc: string
      arbitrageTitle: string
      arbitrageDesc: string
    }
  }
  sidebar: {
    focusTitle: string
    focusSubPrefix: string
    fixedSuffix: string
    surplusTextPrefix: string
    surplusTextSuffix: string
    rainwashActivePrefix: string
    rainwashActiveMiddle: string
    rainwashActiveSuffix: string
    verdictTitle: string
    selectedTool: string
    confidence: string
    frugalTitle: string
    frugalText: string
  }
  prospecting: {
    title: string
    subtitle: string
    secondaryBadge: string
    loading: string
    toolbarTitle: string
    areaLabel: string
    topologyLabel: string
    topologies: {
      single_axis_tracker: string
      fixed_tilt: string
      agrivoltaic: string
    }
    helperText: string
    hud: {
      coordinates: string
      deciderPrefix: string
      frugalSavingsPrefix: string
      capacity: string
      turnkeyCapex: string
      payback: string
      years: string
      tenYearReturn: string
      netUsd: string
      annualGenSuffix: string
      viewProposal: string
    }
    modal: {
      latency: string
      title: string
      highlightsTitle: string
      frugalTitle: string
      closeBtn: string
    }
  }
  benchmark: {
    title: string
    subtitle: string
    details: string[]
  }
  provenance: {
    sample: string
    liveDecider: string
    localDecider: string
    deciderReasons: Record<'endpoint_not_configured' | 'request_failed' | 'invalid_response', string>
    liveBedrock: string
    localBedrock: string
    bedrockReasons: Record<'disabled' | 'request_failed' | 'invalid_response', string>
    modelLabel: string
    measuredDuration: string
    noEnergyMeasurement: string
    noComparison: string
  }
}

export const DICTIONARY: Record<Locale, I18nContent> = {
  en: {
    header: {
      title: 'Kuarahy AX',
      deciderBadge: 'Optional Strands endpoint',
      activeMechatronicsBadge: 'Simulation',
      subtitlePrefix: 'Simulated Solar Tracking & Rainwash · ',
      frugalQuote: '"The Frugal Architect"',
    },
    tabs: {
      mechatronics: 'Digital Twin & Mechatronics',
      prospecting: 'Prospecting Heatmap',
      primaryBadge: 'Primary',
      secondaryBadge: 'Secondary',
    },
    banner: {
      featureTitle: 'Solar telemetry and tracker simulation',
      featureDesc: 'Interactive solar-tracking simulation. When configured, the server can request a tool choice from a Strands Decider endpoint; otherwise it uses a labeled local heuristic. No physical tracker is connected.',
      durationLabel: 'Decision request duration',
    },
    kpi: {
      mechatronicAdvantage: {
        title: 'Simulated tracker gain',
        comparison: 'simulation vs fixed-panel baseline',
        statusTag: 'Simulation',
      },
      netActivePower: {
        title: 'Active Net Power',
        comparison: 'simulated power difference',
        statusTagPrefix: 'fixed',
      },
      deciderLatency: {
        title: 'Decision request duration',
        comparison: 'per-request duration; not a benchmark',
        statusTag: 'Request duration',
      },
      crewSavings: {
        title: 'Modeled cleaning-cost estimate',
        activeComparison: 'illustrative rainwash scenario',
        idleComparison: 'No estimate for this scenario',
        statusTag: 'Illustrative',
      },
    },
    twin: {
      title: 'Digital Twin: Simulated Mechatronic Behavior',
      subtitle: 'Interactive visualization of a simulated solar path, panel tilt angle, and radiation vectors.',
      motorTilt: 'Motor Tilt',
      evaluating: 'Evaluating solar scenario...',
      solarHour: 'Solar Hour',
      elevation: 'Elevation',
      directGti: 'Direct GTI',
      sunrise: 'Sunrise (05:00)',
      solarNoon: 'Solar Noon (12:00)',
      sunset: 'Sunset (20:00)',
      presetsLabel: 'Judges Demo Scenarios:',
      presets: {
        trackingTitle: '☀️ Solar Tracking',
        trackingDesc: 'Continuous alignment (+24.8% gain)',
        rainwashTitle: '🌧️ Self-Cleaning',
        rainwashDesc: '65° tilt during rainfall',
        stormTitle: '🌪️ Wind Gust',
        stormDesc: '0° horizontal defense stow',
        arbitrageTitle: '🔋 Grid Arbitrage',
        arbitrageDesc: 'Peak spot tariff injection',
      },
    },
    sidebar: {
      focusTitle: 'Simulated Mechatronic Scenario',
      focusSubPrefix: 'Simulated tracker power (vs ',
      fixedSuffix: ' fixed)',
      surplusTextPrefix: '+',
      surplusTextSuffix: ' kW simulated power difference; no physical equipment is connected.',
      rainwashActivePrefix: '🌧️ Simulated rainwash scenario: 65° tilt with ',
      rainwashActiveMiddle: ' soiling. Illustrative local cleaning-cost estimate: $',
      rainwashActiveSuffix: ' USD/year; not verified savings.',
      verdictTitle: 'Decision provenance',
      selectedTool: 'Selected Tool',
      confidence: 'Reported confidence score',
      frugalTitle: '🏛️ Frugal Architecture (Werner Vogels)',
      frugalText: 'This demo reports the duration of an individual request only. It does not measure energy use, compare model latency, or control physical equipment.',
    },
    prospecting: {
      title: 'Solar Field Prospecting (MapLibre GL)',
      subtitle: 'Zoom in or click rural parcels to calculate installable capacity (MWp) and 10-year financial return.',
      secondaryBadge: 'Secondary Feature',
      loading: 'Loading MapLibre GL solar heatmap...',
      toolbarTitle: 'Kuarahy Solar Heatmap',
      areaLabel: 'Parcel Surface Area (Hectares):',
      topologyLabel: 'Technology Topology:',
      topologies: {
        single_axis_tracker: '1-Axis Tracker',
        fixed_tilt: 'Fixed Tilt',
        agrivoltaic: 'Agrivoltaic',
      },
      helperText: 'Click or zoom on a rural parcel to estimate solar potential with the local model.',
      hud: {
        coordinates: 'Coordinates',
        deciderPrefix: '⚡ Strands Decider 2B: ',
        frugalSavingsPrefix: 'Energy estimate: ',
        capacity: 'Capacity',
        turnkeyCapex: 'Turnkey CapEx',
        payback: 'Payback',
        years: 'years',
        tenYearReturn: '10-Year Return:',
        netUsd: 'net USD',
        annualGenSuffix: 'MWh/yr',
        viewProposal: 'View generated project summary',
      },
      modal: {
        latency: 'Latency: ',
        title: 'Investment Memorandum & Financial Return Projection',
        highlightsTitle: 'Key Project Highlights',
        frugalTitle: '🏛️ Frugal Architecture Principle (Werner Vogels):',
        closeBtn: 'Close',
      },
    },
    benchmark: {
      title: 'What this demo measures',
      subtitle: 'The values below are generated by a local solar simulation and are not field measurements or model benchmarks.',
      details: [
        'Telemetry and equipment behavior are simulated; no physical tracker or sensor is connected.',
        'Decision duration is measured for an individual server request and includes local fallback time when used. It is not a P95 benchmark.',
        'Energy consumption, energy savings, and comparisons against other models are not measured by this application.',
        'Financial outputs are estimates from the local valuation model, not investment advice or verified savings.',
      ],
    },
    provenance: {
      sample: 'Sample UI values — no decision request completed yet.',
      liveDecider: 'Remote decision returned by the configured Strands Decider endpoint.',
      localDecider: 'Local heuristic fallback; no Decider inference was attributed.',
      deciderReasons: {
        endpoint_not_configured: 'No endpoint configured',
        request_failed: 'Endpoint request failed',
        invalid_response: 'Endpoint response did not match the expected contract',
      },
      liveBedrock: 'Summary returned by Amazon Bedrock using the configured model.',
      localBedrock: 'Simulated local summary; Amazon Bedrock did not generate this content.',
      bedrockReasons: {
        disabled: 'Bedrock is disabled',
        request_failed: 'Bedrock request failed',
        invalid_response: 'Bedrock returned no usable text',
      },
      modelLabel: 'Model',
      measuredDuration: 'Request duration',
      noEnergyMeasurement: 'Not measured',
      noComparison: 'No comparison available',
    },
  },
  es: {
    header: {
      title: 'Kuarahy AX',
      deciderBadge: 'Endpoint Strands opcional',
      activeMechatronicsBadge: 'Simulación',
      subtitlePrefix: 'Seguimiento y autolavado simulados · ',
      frugalQuote: '"The Frugal Architect"',
    },
    tabs: {
      mechatronics: 'Gemelo Digital & Mecatrónica',
      prospecting: 'Mapa de Prospección',
      primaryBadge: 'Principal',
      secondaryBadge: 'Secundaria',
    },
    banner: {
      featureTitle: 'Simulación de telemetría solar y seguimiento',
      featureDesc: 'Simulación interactiva de seguimiento solar. Si se configura, el servidor puede solicitar una elección a un endpoint Strands Decider; de lo contrario usa una heurística local identificada. No hay un seguidor físico conectado.',
      durationLabel: 'Duración de la solicitud',
    },
    kpi: {
      mechatronicAdvantage: {
        title: 'Ganancia simulada del seguidor',
        comparison: 'simulación vs referencia de panel fijo',
        statusTag: 'Simulación',
      },
      netActivePower: {
        title: 'Potencia Activa Neta',
        comparison: 'diferencia de potencia simulada',
        statusTagPrefix: 'fijo',
      },
      deciderLatency: {
        title: 'Duración de solicitud de decisión',
        comparison: 'duración por solicitud; no es benchmark',
        statusTag: 'Duración de solicitud',
      },
      crewSavings: {
        title: 'Estimación de costo de limpieza',
        activeComparison: 'escenario ilustrativo de autolavado',
        idleComparison: 'Sin estimación para este escenario',
        statusTag: 'Ilustrativo',
      },
    },
    twin: {
      title: 'Gemelo Digital: Comportamiento Mecatrónico Simulado',
      subtitle: 'Visualización interactiva de una trayectoria solar, inclinación y vectores de radiación simulados.',
      motorTilt: 'Tilt Motor',
      evaluating: 'Evaluando escenario solar...',
      solarHour: 'Hora Solar',
      elevation: 'Elevación',
      directGti: 'GTI Directo',
      sunrise: 'Amanecer (05:00)',
      solarNoon: 'Cénit Solar (12:00)',
      sunset: 'Atardecer (20:00)',
      presetsLabel: 'Escenarios de Demostración para Jueces:',
      presets: {
        trackingTitle: '☀️ Seguimiento',
        trackingDesc: 'Ajuste continuo (+24.8% ganancia)',
        rainwashTitle: '🌧️ Autolavado',
        rainwashDesc: 'Inclinación 65° ante lluvia',
        stormTitle: '🌪️ Ráfaga Viento',
        stormDesc: 'Stow horizontal a 0° de defensa',
        arbitrageTitle: '🔋 Arbitraje Red',
        arbitrageDesc: 'Inyección en pico de tarifa spot',
      },
    },
    sidebar: {
      focusTitle: 'Escenario Mecatrónico Simulado',
      focusSubPrefix: 'Potencia simulada del seguidor (vs ',
      fixedSuffix: ' fijo)',
      surplusTextPrefix: '+',
      surplusTextSuffix: ' kW de excedente simulado; no hay equipos físicos conectados.',
      rainwashActivePrefix: '🌧️ Escenario simulado de autolavado: inclinación a 65° con ',
      rainwashActiveMiddle: ' de suciedad. Estimación local ilustrativa de costo de limpieza: $',
      rainwashActiveSuffix: ' USD/año; no son ahorros verificados.',
      verdictTitle: 'Procedencia de la decisión',
      selectedTool: 'Herramienta Seleccionada',
      confidence: 'Puntuación de confianza reportada',
      frugalTitle: '🏛️ Filosofía Frugal (Werner Vogels)',
      frugalText: 'Esta demo informa la duración de una solicitud individual. No mide consumo energético, no compara latencia entre modelos ni controla equipos físicos.',
    },
    prospecting: {
      title: 'Prospección de Campos Solares (MapLibre GL)',
      subtitle: 'Hacé zoom o click en terrenos rurales para calcular la potencia instalable (MWp) y retorno financiero en 10 años.',
      secondaryBadge: 'Feature Secundaria',
      loading: 'Cargando mapa de calor MapLibre GL...',
      toolbarTitle: 'Kuarahy Solar Heatmap',
      areaLabel: 'Superficie del Campo (Hectáreas):',
      topologyLabel: 'Topología Tecnológica:',
      topologies: {
        single_axis_tracker: '1-Axis Tracker',
        fixed_tilt: 'Fixed Tilt',
        agrivoltaic: 'Agrivoltaic',
      },
      helperText: 'Hacé click o zoom sobre un terreno rural para estimar el potencial solar con el modelo local.',
      hud: {
        coordinates: 'Coordenadas',
        deciderPrefix: '⚡ Strands Decider 2B: ',
        frugalSavingsPrefix: 'Estimación energética: ',
        capacity: 'Potencia',
        turnkeyCapex: 'CapEx Turnkey',
        payback: 'Payback',
        years: 'años',
        tenYearReturn: 'Retorno a 10 años:',
        netUsd: 'USD netos',
        annualGenSuffix: 'MWh/año',
        viewProposal: 'Ver resumen de proyecto generado',
      },
      modal: {
        latency: 'Latencia: ',
        title: 'Dictamen de Inversión y Proyección de Retorno',
        highlightsTitle: 'Puntos Clave del Proyecto',
        frugalTitle: '🏛️ Principio de Arquitectura Frugal (Werner Vogels):',
        closeBtn: 'Cerrar',
      },
    },
    benchmark: {
      title: 'Qué mide esta demo',
      subtitle: 'Los valores se generan mediante una simulación solar local; no son mediciones de campo ni benchmarks de modelos.',
      details: [
        'La telemetría y el comportamiento del equipo son simulados; no hay sensores ni seguidores físicos conectados.',
        'La duración de decisión corresponde a una solicitud individual al servidor e incluye el tiempo de fallback local cuando se usa. No es un benchmark P95.',
        'La aplicación no mide consumo ni ahorro energético y no compara modelos.',
        'Los resultados financieros son estimaciones del modelo de valuación local, no asesoramiento financiero ni ahorros verificados.',
      ],
    },
    provenance: {
      sample: 'Valores de muestra de la interfaz: aún no se completó una solicitud de decisión.',
      liveDecider: 'Elección remota devuelta por el endpoint Strands Decider configurado.',
      localDecider: 'Fallback heurístico local; no se atribuyó inferencia al Decider.',
      deciderReasons: {
        endpoint_not_configured: 'No hay endpoint configurado',
        request_failed: 'Falló la solicitud al endpoint',
        invalid_response: 'La respuesta no coincide con el contrato esperado',
      },
      liveBedrock: 'Resumen devuelto por Amazon Bedrock usando el modelo configurado.',
      localBedrock: 'Resumen local simulado; Amazon Bedrock no generó este contenido.',
      bedrockReasons: {
        disabled: 'Bedrock está deshabilitado',
        request_failed: 'Falló la solicitud a Bedrock',
        invalid_response: 'Bedrock no devolvió texto utilizable',
      },
      modelLabel: 'Modelo',
      measuredDuration: 'Duración de la solicitud',
      noEnergyMeasurement: 'Sin medición',
      noComparison: 'Sin comparación disponible',
    },
  },
}
