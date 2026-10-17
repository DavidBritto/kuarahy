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
    p95Label: string
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
    bonusBadge: string
    headers: {
      metric: string
      decider: string
      frontier: string
      efficiency: string
    }
    rows: {
      latency: { name: string; decider: string; frontier: string; factor: string }
      energy: { name: string; decider: string; frontier: string; factor: string }
      rainwash: { name: string; decider: string; frontier: string; factor: string }
      gain: { name: string; decider: string; frontier: string; factor: string }
    }
  }
}

export const DICTIONARY: Record<Locale, I18nContent> = {
  en: {
    header: {
      title: 'Kuarahy AX',
      deciderBadge: 'Strands Decider 2B',
      activeMechatronicsBadge: 'Active Mechatronics',
      subtitlePrefix: 'Autonomous Solar Tracking & Rainwash · ',
      frugalQuote: '"The Frugal Architect"',
    },
    tabs: {
      mechatronics: 'Digital Twin & Mechatronics',
      prospecting: 'Prospecting Heatmap',
      primaryBadge: 'Primary',
      secondaryBadge: 'Secondary',
    },
    banner: {
      featureTitle: 'Primary Feature: Mechatronic Energy Gain & Autonomous Rainwash',
      featureDesc:
        'Fixed panels lose up to 30% of energy due to cosine incidence angle and up to 15% from dust and particulate soiling. Kuarahy AX links tracker mechatronics to AWS Strands Decider 2B (<115ms) to continuously face the sun, and actuates 65° hydro-mechanical rainwash when precipitation is detected, saving thousands in manual cleaning crews.',
      p95Label: 'Decider 2B P95',
    },
    kpi: {
      mechatronicAdvantage: {
        title: 'Mechatronic Advantage',
        comparison: 'vs traditional fixed-tilt',
        statusTag: 'Hero Metric',
      },
      netActivePower: {
        title: 'Active Net Power',
        comparison: 'net surplus generation',
        statusTagPrefix: 'fixed',
      },
      deciderLatency: {
        title: 'Decider 2B Latency',
        comparison: '99.2% faster than Cloud LLM',
        statusTag: 'Werner Vogels P95',
      },
      crewSavings: {
        title: 'Cleaning Crew Savings',
        activeComparison: '65° rainwash active',
        idleComparison: 'Rain eliminates manual wash crews',
        statusTag: 'Optimized O&M',
      },
    },
    twin: {
      title: 'Digital Twin: Real-Time Mechatronic Actuation',
      subtitle: 'Physical visualization of solar path, panel tilt angle, and normal radiation vectors.',
      motorTilt: 'Motor Tilt',
      evaluating: 'Strands Decider 2B evaluating...',
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
      focusTitle: 'Quantified Mechatronic Advantage',
      focusSubPrefix: 'Power with active mechatronic tracker (vs ',
      fixedSuffix: ' fixed)',
      surplusTextPrefix: '+',
      surplusTextSuffix: ' kW instantaneous net surplus generation enabled by Strands Decider 2B micro-adjustments.',
      rainwashActivePrefix: '🌧️ Active Rainwash Mode: 65° tilt leverages natural rainfall to wash away ',
      rainwashActiveMiddle: ' accumulated dust soiling. Projected savings of $',
      rainwashActiveSuffix: ' USD/year in eliminated manual wash crews.',
      verdictTitle: 'Strands Decider 2B Verdict',
      selectedTool: 'Selected Tool',
      confidence: 'Calibrated Confidence',
      frugalTitle: '🏛️ Frugal Architecture (Werner Vogels)',
      frugalText:
        'A motor gear actuator cannot wait 2 seconds for a cloud LLM to respond. Strands Decider 2B resolves in 14ms at the edge, saving 0.24 Wh per control cycle.',
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
      helperText: 'Click or zoom on any rural parcel to compute solar potential in real time.',
      hud: {
        coordinates: 'Coordinates',
        deciderPrefix: '⚡ Strands Decider 2B: ',
        frugalSavingsPrefix: 'Frugal Savings: ',
        capacity: 'Capacity',
        turnkeyCapex: 'Turnkey CapEx',
        payback: 'Payback',
        years: 'years',
        tenYearReturn: '10-Year Return:',
        netUsd: 'net USD',
        annualGenSuffix: 'MWh/yr',
        viewProposal: 'View Amazon Bedrock Executive Proposal',
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
      title: 'Frugal Architecture Benchmark: Strands Decider 2B vs Frontier LLMs',
      subtitle: 'Comparison of decision latency, energy consumption, and compute cost in telemetry tool dispatch.',
      bonusBadge: 'Rubric Bonus: +30% Use of Decider 2B',
      headers: {
        metric: 'Evaluation Metric',
        decider: 'AWS Strands Decider 2B (Kuarahy AX)',
        frontier: 'Frontier LLM (70B+ in Cloud)',
        efficiency: 'Efficiency Factor',
      },
      rows: {
        latency: {
          name: 'Decision Latency (P95)',
          decider: '< 115 ms (measured: 14ms)',
          frontier: '~1,850 ms',
          factor: '16x faster',
        },
        energy: {
          name: 'Energy Consumption / Decision',
          decider: '~0.00008 Wh (Edge/Graviton)',
          frontier: '~0.24 Wh (arXiv: 2508.15734)',
          factor: '3,000x more efficient',
        },
        rainwash: {
          name: 'Autonomous Mechatronic Rainwash',
          decider: 'Automatic 65° tilt actuation',
          frontier: 'N/A / Inoperable at Edge',
          factor: '$1,850 USD/yr saved',
        },
        gain: {
          name: 'Mechatronic Energy Gain',
          decider: '+24.8% MWh vs Fixed-Tilt Panel',
          frontier: '0% (Pure inference)',
          factor: 'Peak Performance',
        },
      },
    },
  },
  es: {
    header: {
      title: 'Kuarahy AX',
      deciderBadge: 'Strands Decider 2B',
      activeMechatronicsBadge: 'Mecatrónica Activa',
      subtitlePrefix: 'Seguimiento Solar & Autolavado Autónomo · ',
      frugalQuote: '"The Frugal Architect"',
    },
    tabs: {
      mechatronics: 'Gemelo Digital & Mecatrónica',
      prospecting: 'Mapa de Prospección',
      primaryBadge: 'Principal',
      secondaryBadge: 'Secundaria',
    },
    banner: {
      featureTitle: 'Feature Principal: Ganancia de Energía & Autolavado por Mecatrónica',
      featureDesc:
        'Los paneles fijos pierden hasta un 30% de energía por coseno de incidencia y hasta un 15% adicional por suciedad (soiling). Kuarahy AX conecta la mecatrónica del seguidor a AWS Strands Decider 2B (<115ms) para orientar los paneles al sol en tiempo real, y activar autolavado hidromecánico a 65° cuando detecta lluvia, ahorrando miles de dólares en cuadrillas de limpieza.',
      p95Label: 'Decider 2B P95',
    },
    kpi: {
      mechatronicAdvantage: {
        title: 'Ventaja Mecatrónica',
        comparison: 'vs panel fijo tradicional',
        statusTag: 'Hero Metric',
      },
      netActivePower: {
        title: 'Potencia Activa Neta',
        comparison: 'excedente neto instantáneo',
        statusTagPrefix: 'fijo',
      },
      deciderLatency: {
        title: 'Latencia Decider 2B',
        comparison: '99.2% menor que Cloud LLM',
        statusTag: 'Werner Vogels P95',
      },
      crewSavings: {
        title: 'Ahorro Cuadrillas',
        activeComparison: 'Autolavado 65° activo',
        idleComparison: 'Lluvia elimina lavado manual',
        statusTag: 'O&M Optimizado',
      },
    },
    twin: {
      title: 'Gemelo Digital: Actuación Mecatrónica en Tiempo Real',
      subtitle: 'Visualización física de la trayectoria solar, ángulo de inclinación del panel y vectores de radiación normales.',
      motorTilt: 'Tilt Motor',
      evaluating: 'Strands Decider 2B evaluando...',
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
      focusTitle: 'Ventaja Mecatrónica Cuantificada',
      focusSubPrefix: 'Potencia con seguidor mecatrónico activo (vs ',
      fixedSuffix: ' fijo)',
      surplusTextPrefix: '+',
      surplusTextSuffix: ' kW de generación neta excedente instantánea gracias a los microajustes de Strands Decider 2B.',
      rainwashActivePrefix: '🌧️ Modo Autolavado Activo: Inclinación a 65° aprovecha el agua de lluvia natural para lavar ',
      rainwashActiveMiddle: ' de polvo acumulado. Ahorro proyectado de $',
      rainwashActiveSuffix: ' USD/año en servicio de limpieza manual.',
      verdictTitle: 'Dictamen Strands Decider 2B',
      selectedTool: 'Herramienta Seleccionada',
      confidence: 'Nivel de Confianza Calibrado',
      frugalTitle: '🏛️ Filosofía Frugal (Werner Vogels)',
      frugalText:
        'Un actuador de motorreductor no puede esperar 2 segundos a que un LLM en la nube responda. Strands Decider 2B resuelve en 14ms en el borde, ahorrando 0.24 Wh por ciclo de control.',
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
      helperText: 'Hacé click o zoom sobre cualquier terreno rural para calcular el potencial solar en tiempo real.',
      hud: {
        coordinates: 'Coordenadas',
        deciderPrefix: '⚡ Strands Decider 2B: ',
        frugalSavingsPrefix: 'Ahorro Frugal: ',
        capacity: 'Potencia',
        turnkeyCapex: 'CapEx Turnkey',
        payback: 'Payback',
        years: 'años',
        tenYearReturn: 'Retorno a 10 años:',
        netUsd: 'USD netos',
        annualGenSuffix: 'MWh/año',
        viewProposal: 'Ver Propuesta Ejecutiva Amazon Bedrock',
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
      title: 'Benchmark de Arquitectura Frugal: Strands Decider 2B vs Frontier LLMs',
      subtitle: 'Comparativa de latencia, consumo energético y costo computacional en despacho de herramientas de telemetría.',
      bonusBadge: 'Rubric Bonus: +30% Use of Decider 2B',
      headers: {
        metric: 'Métrica de Evaluación',
        decider: 'AWS Strands Decider 2B (Kuarahy AX)',
        frontier: 'Frontier LLM (70B+ en Cloud)',
        efficiency: 'Factor de Eficiencia',
      },
      rows: {
        latency: {
          name: 'Latencia de Decisión (P95)',
          decider: '< 115 ms (medido: 14ms)',
          frontier: '~1,850 ms',
          factor: '16x más rápido',
        },
        energy: {
          name: 'Consumo Energético / Decisión',
          decider: '~0.00008 Wh (Edge/Graviton)',
          frontier: '~0.24 Wh (arXiv: 2508.15734)',
          factor: '3,000x más eficiente',
        },
        rainwash: {
          name: 'Autolavado Mecatrónico por Lluvia',
          decider: 'Inclinación automática a 65°',
          frontier: 'No aplica / Inoperativo en Edge',
          factor: '$1.850 USD/año ahorrados',
        },
        gain: {
          name: 'Ganancia Energética Mecatrónica',
          decider: '+24.8% MWh vs Panel Fijo',
          frontier: '0% (Inferencia pura)',
          factor: 'Máximo Rendimiento',
        },
      },
    },
  },
}
