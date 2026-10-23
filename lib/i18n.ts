export type Locale = 'en' | 'es'

export interface I18nContent {
  hero: {
    badge: string
    title: string
    subtitle: string
    scrollCue: string
  }
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
      activeStatus: string
      idleStatus: string
      recoveredUnit: string
      cleanlinessUnit: string
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
    regionLabel: string
    regions: {
      global: string
      southAmerica: string
      northAmerica: string
      europeMena: string
      asiaPacific: string
    }
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
    hero: {
      badge: 'Autonomous Solar Intelligence // Mechatronics',
      title: 'SolariA',
      subtitle: 'Deterministic tool selection & high-frequency solar tracking orchestration with Strands Decider 2B.',
      scrollCue: 'Scroll to explore dashboard',
    },
    header: {
      title: 'SolariA',
      deciderBadge: 'Strands Decider 2B',
      activeMechatronicsBadge: 'Active Tracking',
      subtitlePrefix: 'High-Frequency Solar Tracking & Mechatronic Actuation',
      frugalQuote: '',
    },
    tabs: {
      mechatronics: 'Digital Twin & Mechatronics',
      prospecting: 'Prospecting Heatmap',
      primaryBadge: 'Primary',
      secondaryBadge: 'Secondary',
    },
    banner: {
      featureTitle: 'Solar Telemetry and Tracker Optimization',
      featureDesc: 'Real-time solar tracking orchestration and high-frequency mechatronic actuation.',
      durationLabel: 'Decision latency',
    },
    kpi: {
      mechatronicAdvantage: {
        title: 'Tracker Efficiency Advantage',
        comparison: 'vs fixed-tilt baseline',
        statusTag: 'Active Optimization',
      },
      netActivePower: {
        title: 'Active Net Power',
        comparison: 'active power surplus',
        statusTagPrefix: 'fixed',
      },
      deciderLatency: {
        title: 'Decision Latency',
        comparison: 'edge actuation latency',
        statusTag: 'Sub-100ms Target',
      },
      crewSavings: {
        title: 'Rainwash Optimization & Soiling',
        activeComparison: 'Runoff autowash active (65° tilt)',
        idleComparison: 'Monitored; ready for rain cycle',
        statusTag: 'O&M Yield',
        activeStatus: 'WASH ACTIVE',
        idleStatus: 'MONITORING',
        recoveredUnit: 'gain',
        cleanlinessUnit: 'cleanliness',
      },
    },
    twin: {
      title: 'Digital Twin: Real-Time Mechatronic Control',
      subtitle: 'Real-time solar irradiance vectors, mechatronic tracker positioning, and meteorological telemetry.',
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
      focusTitle: 'Mechatronic Actuation State',
      focusSubPrefix: 'Tracker power output (vs ',
      fixedSuffix: ' fixed)',
      surplusTextPrefix: '+',
      surplusTextSuffix: ' kW active power surplus over fixed topology.',
      rainwashActivePrefix: '🌧️ Self-cleaning runoff mode: 65° tilt with ',
      rainwashActiveMiddle: ' soiling index. Estimated OPEX reduction: $',
      rainwashActiveSuffix: ' USD/year.',
      verdictTitle: 'Decider Execution Engine',
      selectedTool: 'Selected Tool',
      confidence: 'Confidence Score',
      frugalTitle: '🏛️ Architecture & Optimization Analysis',
      frugalText: 'High-frequency telemetry analysis and deterministic tool actuation.',
    },
    prospecting: {
      title: 'Solar Field Prospecting (MapLibre GL)',
      subtitle: 'Zoom in or click rural parcels to calculate installable capacity (MWp) and 10-year financial return.',
      secondaryBadge: 'Secondary Feature',
      loading: 'Loading MapLibre GL solar heatmap...',
      toolbarTitle: 'SolariA Solar Heatmap',
      regionLabel: 'Solar Corridor:',
      regions: {
        global: 'Global',
        southAmerica: 'South America',
        northAmerica: 'North America',
        europeMena: 'Europe & MENA',
        asiaPacific: 'Asia-Pacific',
      },
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
        frugalTitle: '🏛️ Architecture & Optimization Analysis:',
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
      sample: 'Baseline telemetry: awaiting live event',
      liveDecider: 'Strands Decider 2B (Neural Inference)',
      localDecider: 'Deterministic Edge Engine (System-One)',
      deciderReasons: {
        endpoint_not_configured: 'Local Edge Mode',
        request_failed: 'Endpoint unreachable — active edge fallback',
        invalid_response: 'Contract mismatch — active edge fallback',
      },
      liveBedrock: 'Amazon Bedrock Generative Synthesis (Nova Micro)',
      localBedrock: 'Autonomous Solar Valuation Engine',
      bedrockReasons: {
        disabled: 'Local Valuation Mode',
        request_failed: 'Inference unreachable — active local fallback',
        invalid_response: 'Response format invalid — active local fallback',
      },
      modelLabel: 'Model',
      measuredDuration: 'Request duration',
      noEnergyMeasurement: 'Baseline reference',
      noComparison: 'Baseline reference',
    },
  },
  es: {
    hero: {
      badge: 'Inteligencia Solar Autónoma // Mecatrónica',
      title: 'SolariA',
      subtitle: 'Selección determinística de herramientas y orquestación de seguimiento solar de alta frecuencia con Strands Decider 2B.',
      scrollCue: 'Hacé scroll para explorar el panel',
    },
    header: {
      title: 'SolariA',
      deciderBadge: 'Strands Decider 2B',
      activeMechatronicsBadge: 'Seguimiento Activo',
      subtitlePrefix: 'Seguimiento Solar de Alta Frecuencia & Actuación Mecatrónica',
      frugalQuote: '',
    },
    tabs: {
      mechatronics: 'Gemelo Digital & Mecatrónica',
      prospecting: 'Mapa de Prospección',
      primaryBadge: 'Principal',
      secondaryBadge: 'Secundaria',
    },
    banner: {
      featureTitle: 'Telemetría Solar y Optimización de Seguimiento',
      featureDesc: 'Orquestación de seguimiento solar en tiempo real y actuación mecatrónica de alta frecuencia.',
      durationLabel: 'Latencia de decisión',
    },
    kpi: {
      mechatronicAdvantage: {
        title: 'Ventaja del Seguidor Solar',
        comparison: 'vs paneles fijos',
        statusTag: 'Optimización Activa',
      },
      netActivePower: {
        title: 'Potencia Activa Neta',
        comparison: 'excedente de potencia activa',
        statusTagPrefix: 'fijo',
      },
      deciderLatency: {
        title: 'Duración de Decisión',
        comparison: 'latencia de actuación en edge',
        statusTag: 'Objetivo Sub-100ms',
      },
      crewSavings: {
        title: 'Optimización de Lavado y Suciedad',
        activeComparison: 'Autolavado por escurrimiento activo (tilt 65°)',
        idleComparison: 'Monitoreando; listo para ciclo de lluvia',
        statusTag: 'Rendimiento O&M',
        activeStatus: 'LAVADO ACTIVO',
        idleStatus: 'MONITOREO',
        recoveredUnit: 'recuperado',
        cleanlinessUnit: 'limpieza',
      },
    },
    twin: {
      title: 'Gemelo Digital: Control Mecatrónico en Tiempo Real',
      subtitle: 'Vectores de irradiación solar, posicionamiento mecatrónico del seguidor y telemetría meteorológica.',
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
      focusTitle: 'Estado de Actuación Mecatrónica',
      focusSubPrefix: 'Potencia del seguidor (vs ',
      fixedSuffix: ' fijo)',
      surplusTextPrefix: '+',
      surplusTextSuffix: ' kW de potencia neta excedente sobre topología fija.',
      rainwashActivePrefix: '🌧️ Modo autolavado por escurrimiento: inclinación a 65° con ',
      rainwashActiveMiddle: ' de suciedad. Reducción estimada de OPEX: $',
      rainwashActiveSuffix: ' USD/año.',
      verdictTitle: 'Motor de Decisión',
      selectedTool: 'Herramienta Seleccionada',
      confidence: 'Nivel de Confianza',
      frugalTitle: '🏛️ Análisis de Arquitectura y Optimización',
      frugalText: 'Análisis de telemetría de alta frecuencia y actuación determinística de herramientas.',
    },
    prospecting: {
      title: 'Prospección de Campos Solares (MapLibre GL)',
      subtitle: 'Hacé zoom o click en terrenos rurales para calcular la potencia instalable (MWp) y retorno financiero en 10 años.',
      secondaryBadge: 'Feature Secundaria',
      loading: 'Cargando mapa de calor MapLibre GL...',
      toolbarTitle: 'SolariA Solar Heatmap',
      regionLabel: 'Corredor Solar:',
      regions: {
        global: 'Global',
        southAmerica: 'Sudamérica',
        northAmerica: 'Norteamérica',
        europeMena: 'Europa & MENA',
        asiaPacific: 'Asia-Pacífico',
      },
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
        frugalTitle: '🏛️ Análisis de Arquitectura y Optimización:',
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
      sample: 'Telemetría base: en espera de evento',
      liveDecider: 'Strands Decider 2B (Inferencia Neuronal)',
      localDecider: 'Motor Determinístico en Edge (System-One)',
      deciderReasons: {
        endpoint_not_configured: 'Modo Edge Local',
        request_failed: 'Endpoint inaccesible — fallback activo en edge',
        invalid_response: 'Discrepancia de contrato — fallback activo en edge',
      },
      liveBedrock: 'Amazon Bedrock Síntesis Generativa (Nova Micro)',
      localBedrock: 'Motor de Valuación Financiera Autónoma',
      bedrockReasons: {
        disabled: 'Modo Valuación Local',
        request_failed: 'Inferencia inaccesible — fallback activo local',
        invalid_response: 'Respuesta inválida — fallback activo local',
      },
      modelLabel: 'Modelo',
      measuredDuration: 'Duración de la solicitud',
      noEnergyMeasurement: 'Referencia base',
      noComparison: 'Referencia base',
    },
  },
}
