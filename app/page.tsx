'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'motion/react'
import SolarArc from '@/components/SolarArc'
import SolarBackground from '@/components/SolarBackground'
import SolarMetricCard from '@/components/SolarMetricCard'
import HeroSection from '@/components/HeroSection'
import BorderBeam from '@/components/BorderBeam'
import type { HourlyPoint, PanelConfig } from '@/lib/types'
import { getPosition } from 'suncalc'
import type { DeciderDecision, SolariaToolAction } from '@/lib/agent/decider-tool-selection'
import { getDeciderProvenanceMessage } from '@/lib/agent/provenance-labels'
import { DICTIONARY, type Locale } from '@/lib/i18n'
import { Zap, Sun, Activity, Cpu, Droplets, ShieldAlert, Sparkles, Globe, Clock, Radio } from 'lucide-react'

// Dynamic import of SolarHeatmap to avoid SSR issues with MapLibre GL
const SolarHeatmap = dynamic(() => import('@/components/SolarHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex items-center justify-center text-zinc-400 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-orange-400 font-mono text-xs">
        <span className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
        <span>Loading MapLibre GL solar heatmap...</span>
      </div>
    </div>
  ),
})

const DEFAULT_PANEL: PanelConfig = {
  azimuth: 20,
  tilt: 25,
  areaM2: 10000,
  efficiency: 0.21,
  performanceRatio: 0.85,
}

function buildDayTelemetry(lat: number, lon: number): HourlyPoint[] {
  const points: HourlyPoint[] = []
  const today = new Date()

  for (let h = 5; h <= 20; h++) {
    const d = new Date(today)
    d.setHours(h, 0, 0, 0)
    const tsMs = d.getTime()
    const { altitude, azimuth } = getPosition(new Date(tsMs), lat, lon)
    const elevation = altitude
    const ghi = elevation > 0 ? Math.max(0, Math.sin((elevation * Math.PI) / 180)) * 950 : 0
    const poa = ghi * 1.05

    points.push({
      ts: tsMs,
      sun: { ts: tsMs, elevation, azimuth },
      ghi,
      dni: ghi * 0.85,
      dhi: ghi * 0.15,
      poa,
      gtiApi: poa,
      cosIncidence: Math.max(0, Math.sin((Math.max(elevation, 0) * Math.PI) / 180)),
      cloudCover: 5,
      temperature: 24,
      powerKw: (poa * 10 * 0.21 * 0.85) / 1000,
      powerOptimalKw: (poa * 10 * 0.21 * 0.85 * 1.248) / 1000,
    })
  }
  return points
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'mechatronics' | 'prospecting'>('mechatronics')
  const [locale, setLocale] = useState<Locale>('en') // Default to English for AWS Builder Center

  const t = DICTIONARY[locale]

  // Language switcher fade-out with scroll
  const { scrollY } = useScroll()
  const langOpacity = useTransform(scrollY, [0, 140], [1, 0])
  const langY = useTransform(scrollY, [0, 140], [0, -15])
  const langPointerEvents = useTransform(scrollY, (y) => (y > 140 ? 'none' : 'auto'))

  // Telemetry simulation & live state
  const [hourIndex, setHourIndex] = useState<number>(7) // ~12:00 PM midday default
  const [isRealTimeMode, setIsRealTimeMode] = useState<boolean>(true)
  const [isLiveTelemetry, setIsLiveTelemetry] = useState<boolean>(false)
  const [telemetrySource, setTelemetrySource] = useState<string>('Connecting to Open-Meteo...')
  const [syncedTime, setSyncedTime] = useState<string>('')
  const [points, setPoints] = useState<HourlyPoint[]>(() => buildDayTelemetry(-27.47, -58.83))

  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(12)
  const [precipitationMm, setPrecipitationMm] = useState<number>(0)
  const [soilingLossPct, setSoilingLossPct] = useState<number>(8.5)
  const [batterySocPct, setBatterySocPct] = useState<number>(65)
  const [tariffPrice, setTariffPrice] = useState<number>(0.12)
  const [hasReceivedActuation, setHasReceivedActuation] = useState(false)

  // Synthetic values keep the offline demo populated until its first API response.
  const [actuationData, setActuationData] = useState<{
    status: string
    motorTiltDeg: number
    gainPct: number
    trackingPowerKw: number
    fixedPowerKw: number
    powerDeltaKw: number
    isRaining: boolean
    cleaningSavingsYearUsd: number
    decision: DeciderDecision<SolariaToolAction>
  }>({
    status: 'ACTIVE_TRACKING',
    motorTiltDeg: 28,
    gainPct: 24.8,
    trackingPowerKw: 9.42,
    fixedPowerKw: 7.55,
    powerDeltaKw: 1.87,
    isRaining: false,
    cleaningSavingsYearUsd: 0,
    decision: {
      choice: 'adjust_solar_tracker',
      confidence: 0.96,
      latencyMs: 0,
      engine: 'heuristic-fallback',
      model: null,
      whEstimated: null,
      fallbackReason: 'endpoint_not_configured',
      reasoning: 'Sample display value. No decision request has completed.',
      timestamp: 0,
    },
  })

  const [loadingDecision, setLoadingDecision] = useState<boolean>(false)

  // Sync with user's real-time clock and Open-Meteo live solar telemetry
  const syncWithUserClock = async () => {
    const now = new Date()
    const currentH = now.getHours()
    const mappedIndex = Math.min(Math.max(currentH - 5, 0), 15)
    setHourIndex(mappedIndex)
    setIsRealTimeMode(true)

    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setSyncedTime(formattedTime)

    try {
      const res = await fetch('/api/telemetry/live?lat=-27.47&lon=-58.83')
      if (res.ok) {
        const data = await res.json()
        if (data.points && data.points.length > 0) {
          setPoints(data.points)
        }
        setIsLiveTelemetry(Boolean(data.isLive))
        setTelemetrySource(data.source)
        if (data.current) {
          setWindSpeedKmh(data.current.windSpeedKmh)
          setPrecipitationMm(data.current.precipitationMm)
        }
      }
    } catch (e) {
      console.warn('Could not sync with live telemetry, keeping local model:', e)
      setTelemetrySource('Deterministic Physical Model & SunCalc')
    }
  }

  // Load live telemetry on mount
  useEffect(() => {
    syncWithUserClock()
  }, [])

  const safeIndex = Math.max(0, Math.min(points.length - 1, hourIndex))
  const currentPoint = points[safeIndex] || points[0]
  const decisionSource = getDeciderProvenanceMessage(actuationData.decision, hasReceivedActuation, {
    sample: t.provenance.sample,
    live: t.provenance.liveDecider,
    fallback: t.provenance.localDecider,
    fallbackReasons: t.provenance.deciderReasons,
  })

  // Query Strands Decider 2B Mechatronics Actuation on state changes
  useEffect(() => {
    let isCancelled = false

    async function evaluateMechatronics() {
      setLoadingDecision(true)
      try {
        const res = await fetch('/api/mechatronics/actuate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elevation: currentPoint.sun.elevation,
            gti: currentPoint.poa,
            windSpeedKmh,
            precipitationMm,
            soilingLossPct,
            batterySocPct,
            tariffPriceUsdPerKwh: tariffPrice,
          }),
        })

        if (res.ok && !isCancelled) {
          const data = await res.json()
          setActuationData({
            status: data.mechatronics.status,
            motorTiltDeg: data.mechatronics.motorTiltDeg,
            gainPct: data.mechatronics.gainPct,
            trackingPowerKw: data.mechatronics.trackingPowerKw,
            fixedPowerKw: data.mechatronics.fixedPowerKw,
            powerDeltaKw: data.mechatronics.powerDeltaKw,
            isRaining: data.mechatronics.isRaining,
            cleaningSavingsYearUsd: data.mechatronics.cleaningSavingsYearUsd,
            decision: data.decision,
          })
          setHasReceivedActuation(true)
        }
      } catch (err) {
        console.error('Failed to actuate mechatronics:', err)
      } finally {
        if (!isCancelled) setLoadingDecision(false)
      }
    }

    evaluateMechatronics()
    return () => {
      isCancelled = true
    }
  }, [hourIndex, windSpeedKmh, precipitationMm, soilingLossPct, batterySocPct, tariffPrice, currentPoint.sun.elevation, currentPoint.poa])

  // Presets for instant demonstration
  const setNormalTrackingPreset = () => {
    setIsRealTimeMode(false)
    setHourIndex(7) // Midday
    setWindSpeedKmh(12)
    setPrecipitationMm(0)
    setBatterySocPct(75)
    setTariffPrice(0.12)
  }

  const setRainwashPreset = () => {
    setIsRealTimeMode(false)
    setHourIndex(6)
    setWindSpeedKmh(15)
    setPrecipitationMm(4.8) // Rain triggers wash
    setSoilingLossPct(11.2) // Dirty panels
  }

  const setStormDefensePreset = () => {
    setIsRealTimeMode(false)
    setHourIndex(7)
    setWindSpeedKmh(74) // Dangerous wind triggers 0° stow
    setPrecipitationMm(0)
  }

  const setGridArbitragePreset = () => {
    setIsRealTimeMode(false)
    setHourIndex(14) // Late afternoon / night
    setWindSpeedKmh(8)
    setPrecipitationMm(0)
    setBatterySocPct(85)
    setTariffPrice(0.26) // Peak tariff triggers discharge
  }

  return (
    <div className="relative min-h-screen text-zinc-100 font-sans selection:bg-orange-500 selection:text-black">
      {/* Dynamic Animated Cosmic Void Background with Magnetic Follow */}
      <SolarBackground />

      {/* Hero Section with Central Glow and Scroll Parallax */}
      <HeroSection
        badge={t.hero.badge}
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        scrollCue={t.hero.scrollCue}
      />

      {/* Floating Language Switcher (Fades out seamlessly with scroll) */}
      <motion.div
        style={{
          opacity: langOpacity,
          y: langY,
          pointerEvents: langPointerEvents,
        }}
        className="fixed top-5 right-5 z-50 flex items-center p-1 bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-xl rounded-xl text-xs font-mono font-bold shadow-2xl"
      >
        <div className="flex items-center gap-1 px-1.5 text-zinc-500">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <button
          onClick={() => setLocale('en')}
          aria-label="Switch to English"
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            locale === 'en'
              ? 'bg-orange-500 text-black shadow-sm font-black'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLocale('es')}
          aria-label="Cambiar a Español"
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            locale === 'es'
              ? 'bg-orange-500 text-black shadow-sm font-black'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ES
        </button>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Floating Navigation Tabs (Centered & Sticky when scrolling past Hero) */}
        <div className="sticky top-5 z-40 flex justify-center pointer-events-none mb-6">
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-xl rounded-xl text-xs font-medium shadow-2xl">
            <button
              onClick={() => setActiveTab('mechatronics')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mechatronics'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.tabs.mechatronics}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-black/20 text-black uppercase font-black">{t.tabs.primaryBadge}</span>
            </button>
            <button
              onClick={() => setActiveTab('prospecting')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'prospecting'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🗺️ {t.tabs.prospecting}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-900 text-zinc-400 uppercase font-mono">{t.tabs.secondaryBadge}</span>
            </button>
          </div>
        </div>

        {/* Dynamic shadcn/ui Solar Metric Cards with Orange Tones scaled to % increment */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SolarMetricCard
            title={t.kpi.mechatronicAdvantage.title}
            value={actuationData.gainPct}
            unit="%"
            incrementPct={actuationData.gainPct}
            comparisonText={t.kpi.mechatronicAdvantage.comparison}
            icon={Zap}
            withBorderBeam={true}
            statusTag={t.kpi.mechatronicAdvantage.statusTag}
          />

          <SolarMetricCard
            title={t.kpi.netActivePower.title}
            value={actuationData.trackingPowerKw}
            unit="kW"
            incrementPct={actuationData.gainPct}
            comparisonText={`+${actuationData.powerDeltaKw} kW ${t.kpi.netActivePower.comparison}`}
            icon={Activity}
            statusTag={`${actuationData.fixedPowerKw} kW ${t.kpi.netActivePower.statusTagPrefix}`}
          />

          <SolarMetricCard
            title={t.kpi.deciderLatency.title}
            value={hasReceivedActuation ? (actuationData.decision.latencyMs < 1 ? '< 1' : actuationData.decision.latencyMs) : '—'}
            unit="ms"
            comparisonText={t.kpi.deciderLatency.comparison}
            icon={Cpu}
            statusTag={t.kpi.deciderLatency.statusTag}
          />

          <SolarMetricCard
            title={t.kpi.crewSavings.title}
            value={
              actuationData.isRaining
                ? `+${soilingLossPct.toFixed(1)}`
                : (100 - soilingLossPct).toFixed(1)
            }
            unit={actuationData.isRaining ? `% ${t.kpi.crewSavings.recoveredUnit}` : `% ${t.kpi.crewSavings.cleanlinessUnit}`}
            incrementPct={actuationData.isRaining ? Number(soilingLossPct.toFixed(1)) : -Number(soilingLossPct.toFixed(1))}
            comparisonText={
              actuationData.isRaining
                ? `${t.kpi.crewSavings.activeComparison} · $1,850/yr`
                : t.kpi.crewSavings.idleComparison
            }
            icon={Droplets}
            statusTag={actuationData.isRaining ? t.kpi.crewSavings.activeStatus : t.kpi.crewSavings.idleStatus}
          />
        </section>

        {/* TAB 1: MECHATRONICS & DIGITAL TWIN (HERO FEATURE) */}
        {activeTab === 'mechatronics' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Primary Twin Canvas + Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Digital Twin Visualizer with BorderBeam */}
              <div className="relative lg:col-span-8 p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl shadow-2xl space-y-4 overflow-hidden">
                <BorderBeam duration={12} colorFrom="#f97316" colorTo="#fbbf24" borderWidth={1.5} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
                      {t.twin.title}
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      {t.twin.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {t.twin.motorTilt}: {actuationData.motorTiltDeg}°
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      {actuationData.status}
                    </span>
                  </div>
                </div>

                {/* Live Telemetry Provenance Banner & User Real-Time Clock */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] font-mono backdrop-blur-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full ${isLiveTelemetry ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-orange-400" />
                      {locale === 'es' ? 'Fuente:' : 'Source:'} {telemetrySource}
                    </span>
                    {syncedTime && (
                      <span className="text-zinc-500 text-[10px] font-mono">
                        ({locale === 'es' ? 'Sincronizado' : 'Synced'} {syncedTime})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={syncWithUserClock}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isRealTimeMode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{isRealTimeMode ? (locale === 'es' ? '● HORA EN VIVO' : '● LIVE TIME') : (locale === 'es' ? 'Sincronizar Hora Real' : 'Sync Real Time')}</span>
                  </button>
                </div>

                {/* SVG Digital Twin with Mechatronic Tracker */}
                <div className="relative rounded-xl overflow-hidden border border-zinc-800/80 bg-black/90 p-4 shadow-inner">
                  <SolarArc
                    points={points}
                    now={currentPoint}
                    panel={DEFAULT_PANEL}
                    mode={actuationData.decision.choice}
                    trackerTiltDeg={actuationData.motorTiltDeg}
                    isRaining={actuationData.isRaining}
                    locale={locale}
                  />

                  {loadingDecision && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-zinc-950/90 border border-orange-500/50 rounded-lg text-[10px] font-mono text-orange-300 flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full border border-orange-400 border-t-transparent animate-spin" />
                      <span>{t.twin.evaluating}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Time-of-Day Slider */}
                <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2 text-xs backdrop-blur-md">
                  <div className="flex justify-between text-zinc-300 font-mono text-[11px]">
                    <span>{t.twin.solarHour}: {5 + hourIndex}:00</span>
                    <span>{t.twin.elevation}: {currentPoint.sun.elevation.toFixed(1)}°</span>
                    <span>{t.twin.directGti}: {currentPoint.poa.toFixed(0)} W/m²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={points.length - 1}
                    value={hourIndex}
                    onChange={(e) => {
                      setIsRealTimeMode(false)
                      setHourIndex(Number(e.target.value))
                    }}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{t.twin.sunrise}</span>
                    <span>{t.twin.solarNoon}</span>
                    <span>{t.twin.sunset}</span>
                  </div>
                </div>

                {/* Interactive Presets for Hackathon Demo */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {t.twin.presetsLabel}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={setNormalTrackingPreset}
                      className="p-3 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-orange-500/40 text-left transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] cursor-pointer"
                    >
                      <span className="text-xs font-bold text-orange-400 block group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5" /> {t.twin.presets.trackingTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        {t.twin.presets.trackingDesc}
                      </span>
                    </button>

                    <button
                      onClick={setRainwashPreset}
                      className="p-3 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-sky-500/30 hover:border-sky-400/60 text-left transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(56,189,248,0.15)] cursor-pointer"
                    >
                      <span className="text-xs font-bold text-sky-400 block group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" /> {t.twin.presets.rainwashTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        {t.twin.presets.rainwashDesc}
                      </span>
                    </button>

                    <button
                      onClick={setStormDefensePreset}
                      className="p-3 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-rose-500/30 hover:border-rose-400/60 text-left transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-pointer"
                    >
                      <span className="text-xs font-bold text-rose-400 block group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> {t.twin.presets.stormTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        {t.twin.presets.stormDesc}
                      </span>
                    </button>

                    <button
                      onClick={setGridArbitragePreset}
                      className="p-3 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-purple-500/30 hover:border-purple-400/60 text-left transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
                    >
                      <span className="text-xs font-bold text-purple-400 block group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> {t.twin.presets.arbitrageTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        {t.twin.presets.arbitrageDesc}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Renglón de Referencias del Gemelo Digital */}
                <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/80 text-[11px] font-mono space-y-2.5">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>{locale === 'es' ? 'Guía de Telemetría y Física del Gemelo Digital' : 'Digital Twin Physics & Telemetry Reference'}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[10px]">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-zinc-800/70">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                      <div>
                        <strong className="text-zinc-200 block">{locale === 'es' ? 'Sol & Arco' : 'Sun & Arc'}</strong>
                        <span className="text-zinc-500 text-[9px]">{locale === 'es' ? 'Posición orbital' : 'Orbital position'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-zinc-800/70">
                      <span className="text-amber-400 font-bold shrink-0 font-mono text-xs">n̂ →</span>
                      <div>
                        <strong className="text-zinc-200 block">{locale === 'es' ? 'Vector Normal' : 'Normal Vector'}</strong>
                        <span className="text-zinc-500 text-[9px]">{locale === 'es' ? 'Incidencia 0°' : '0° incidence'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-zinc-800/70">
                      <span className="w-3 h-1.5 rounded-sm bg-blue-600 border border-blue-400 shrink-0" />
                      <div>
                        <strong className="text-zinc-200 block">{locale === 'es' ? 'Cara Activa' : 'Active Face'}</strong>
                        <span className="text-zinc-500 text-[9px]">{locale === 'es' ? 'Celdas PV frente' : 'Front PV cells'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-zinc-800/70">
                      <span className="w-3 h-1.5 rounded-sm bg-slate-800 border border-slate-600 shrink-0" />
                      <div>
                        <strong className="text-zinc-200 block">{locale === 'es' ? 'Chasis' : 'Chassis'}</strong>
                        <span className="text-zinc-500 text-[9px]">{locale === 'es' ? 'Dorso de acero' : 'Steel backing'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-zinc-800/70 col-span-2 sm:col-span-1">
                      <span className="text-emerald-400 shrink-0 text-xs">📡</span>
                      <div>
                        <strong className="text-zinc-200 block">{locale === 'es' ? 'Open-Meteo' : 'Open-Meteo'}</strong>
                        <span className="text-zinc-500 text-[9px]">{locale === 'es' ? 'GTI/DNI en vivo' : 'Live GTI/DNI'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Mechatronic Advantage & Decider 2B Telemetry */}
              <div className="lg:col-span-4 space-y-4">
                {/* Mechatronic Energy Gain Focus Card */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-orange-950/40 via-zinc-950 to-zinc-950 border border-orange-500/40 shadow-xl space-y-3 backdrop-blur-xl overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-orange-400 uppercase font-black tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {t.sidebar.focusTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                      +{actuationData.gainPct}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      {actuationData.trackingPowerKw} kW
                    </div>
                    <div className="text-xs text-zinc-400">
                      {t.sidebar.focusSubPrefix}
                      <span className="text-zinc-500 line-through">{actuationData.fixedPowerKw} kW</span>{t.sidebar.fixedSuffix}
                    </div>
                  </div>

                  <div className="p-3 bg-black/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-300">
                    <span className="text-emerald-400 font-bold">{t.sidebar.surplusTextPrefix}{actuationData.powerDeltaKw}</span>{t.sidebar.surplusTextSuffix}
                  </div>

                  {actuationData.cleaningSavingsYearUsd > 0 && (
                    <div className="p-3 bg-sky-950/30 rounded-xl border border-sky-500/30 text-[11px] text-sky-200">
                      {t.sidebar.rainwashActivePrefix}{soilingLossPct}%{t.sidebar.rainwashActiveMiddle}<strong>{actuationData.cleaningSavingsYearUsd}</strong>{t.sidebar.rainwashActiveSuffix}
                    </div>
                  )}
                </div>

                {/* Strands Decider 2B Decision Reasoning & Telemetry Vector */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl space-y-4 font-mono text-xs backdrop-blur-xl">
                  {/* Card Header: Engine Status & Decision Latency */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${hasReceivedActuation && actuationData.decision.engine === 'strands-decider-2b' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      <div>
                        <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans block">
                          {t.sidebar.verdictTitle}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          #tool-selection // System-One
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold block">
                        {hasReceivedActuation ? (actuationData.decision.latencyMs < 1 ? '< 1 ms' : `${actuationData.decision.latencyMs} ms`) : '—'}
                      </span>
                      <span className="text-[9px] text-zinc-500 mt-0.5 block">
                        {loadingDecision ? (locale === 'es' ? 'evaluando...' : 'evaluating...') : 'sub-115ms SLA'}
                      </span>
                    </div>
                  </div>

                  {/* Input Telemetry Vector (Evaluated by Strands Decider) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-sans">
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                        {locale === 'es' ? 'Vector de Telemetría (API)' : 'Input Telemetry Vector (API)'}
                      </span>
                      <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {isLiveTelemetry ? 'Open-Meteo Live' : 'Physical Model'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-black/60 rounded-xl border border-zinc-800/60 text-[10px]">
                      <div className="space-y-0.5">
                        <span className="text-zinc-500 block text-[9px]">{locale === 'es' ? 'Irradiancia' : 'Irradiance'}</span>
                        <span className="text-amber-400 font-bold">{currentPoint.poa} <span className="text-zinc-500 text-[8px]">W/m²</span></span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-zinc-500 block text-[9px]">{locale === 'es' ? 'Elevación' : 'Elevation'}</span>
                        <span className="text-zinc-200 font-bold">{currentPoint.sun.elevation.toFixed(1)}°</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-zinc-500 block text-[9px]">{locale === 'es' ? 'Viento' : 'Wind Speed'}</span>
                        <span className="text-zinc-200 font-bold">{windSpeedKmh} <span className="text-zinc-500 text-[8px]">km/h</span></span>
                      </div>
                      <div className="space-y-0.5 pt-1 border-t border-zinc-800/40">
                        <span className="text-zinc-500 block text-[9px]">{locale === 'es' ? 'Precipitación' : 'Rain'}</span>
                        <span className="text-sky-400 font-bold">{precipitationMm} <span className="text-zinc-500 text-[8px]">mm/h</span></span>
                      </div>
                      <div className="space-y-0.5 pt-1 border-t border-zinc-800/40">
                        <span className="text-zinc-500 block text-[9px]">{locale === 'es' ? 'Batería SOC' : 'Battery SOC'}</span>
                        <span className="text-emerald-400 font-bold">{batterySocPct}%</span>
                      </div>
                      <div className="space-y-0.5 pt-1 border-t border-zinc-800/40">
                        <span className="text-zinc-500 block text-[9px]">{locale === 'es' ? 'Tarifa Spot' : 'Spot Tariff'}</span>
                        <span className="text-orange-400 font-bold">${tariffPrice.toFixed(2)}<span className="text-zinc-500 text-[8px]">/kWh</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Strands Decider Tool Selection & Actuation Output */}
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">{t.sidebar.selectedTool}</span>
                        <span className="text-orange-400 font-bold text-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          {actuationData.decision.choice}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">{locale === 'es' ? 'Actuación Mecatrónica' : 'Mechatronic Status'}</span>
                        <span className="text-zinc-200 font-bold text-xs bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {actuationData.status} ({actuationData.motorTiltDeg}°)
                        </span>
                      </div>
                    </div>

                    {/* Confidence Score Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500 uppercase font-semibold">{t.sidebar.confidence}</span>
                        <span className="text-zinc-200 font-bold">{(actuationData.decision.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, actuationData.decision.confidence * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Decision Reasoning Box */}
                    <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-300 font-sans leading-relaxed">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1 text-[10px] uppercase font-mono">
                        <span>⚡ {locale === 'es' ? 'Fundamento Físico de Decisión' : 'Physical Decision Rationale'}:</span>
                      </div>
                      {actuationData.decision.reasoning}
                    </div>

                    {/* Engine Provenance Note */}
                    <div className="text-[10px] text-zinc-500 font-sans flex items-center justify-between pt-1">
                      <span className="truncate max-w-[210px]" title={decisionSource}>
                        {decisionSource}
                      </span>
                      {hasReceivedActuation && actuationData.decision.engine === 'strands-decider-2b' && actuationData.decision.model && (
                        <span className="text-zinc-400 font-mono text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          {actuationData.decision.model}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOLAR PROSPECTING HEATMAP (SECONDARY FEATURE) */}
        {activeTab === 'prospecting' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-center justify-between backdrop-blur-xl">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.prospecting.title}
                </h2>
                <p className="text-xs text-zinc-400">
                  {t.prospecting.subtitle}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-orange-500/10 text-orange-400 border border-orange-500/30">
                {t.prospecting.secondaryBadge}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl">
              <SolarHeatmap locale={locale} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
