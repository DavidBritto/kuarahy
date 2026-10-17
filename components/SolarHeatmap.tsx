'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getSolarHeatmapGeoJSON, estimateGtiFromCoords } from '@/lib/solar-heatmap-data'
import type { SolarFieldTopology, SolarValuationMetrics } from '@/lib/solar-valuation'
import type { BedrockProspectingSummaryOutput } from '@/lib/agent/bedrock-financial-model'
import type { DeciderDecision } from '@/lib/agent/decider-tool-selection'
import { DICTIONARY, type Locale } from '@/lib/i18n'

// Set local web worker URL to prevent bundler/worker resolution failures
if (typeof window !== 'undefined' && maplibregl.setWorkerUrl) {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs')
}

interface ProspectApiResponse {
  success: boolean
  decider: DeciderDecision
  valuation: SolarValuationMetrics
  bedrock: BedrockProspectingSummaryOutput
  meta: {
    frugalSavingsWh: number
    frugalLatencySavingsMs: number
  }
}

interface SolarHeatmapProps {
  onProspectResolved?: (data: ProspectApiResponse) => void
  locale?: Locale
}

export default function SolarHeatmap({ onProspectResolved, locale = 'en' }: SolarHeatmapProps) {
  const t = DICTIONARY[locale]
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  const [areaHa, setAreaHa] = useState<number>(10)
  const [topology, setTopology] = useState<SolarFieldTopology>('single_axis_tracker')
  const [loading, setLoading] = useState<boolean>(false)
  const [prospectData, setProspectData] = useState<ProspectApiResponse | null>(null)
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>({
    lat: -31.4201,
    lon: -64.1888, // Córdoba default
  })
  const [showBedrockModal, setShowBedrockModal] = useState<boolean>(false)

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-64.1888, -31.4201],
      zoom: 6,
      maxZoom: 17,
      minZoom: 3,
    })

    mapRef.current = map

    map.on('error', (err) => {
      console.warn('MapLibre notice:', err)
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      map.resize()

      // 1. Add Solar Heatmap Source
      const heatmapData = getSolarHeatmapGeoJSON()
      map.addSource('solar-potential', {
        type: 'geojson',
        data: heatmapData,
      })

      // 2. Add Heatmap Layer
      map.addLayer({
        id: 'solar-heat-layer',
        type: 'heatmap',
        source: 'solar-potential',
        maxzoom: 12,
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 1, 9, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 0, 0, 0)',
            0.2,
            'rgba(255, 230, 0, 0.4)',
            0.5,
            'rgba(255, 140, 0, 0.7)',
            0.8,
            'rgba(255, 60, 0, 0.85)',
            1,
            'rgba(255, 255, 220, 0.95)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 25, 9, 65],
          'heatmap-opacity': 0.75,
        },
      })

      // 3. Add Parcel Polygon Source
      map.addSource('selected-parcel', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      map.addLayer({
        id: 'parcel-fill',
        type: 'fill',
        source: 'selected-parcel',
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.25,
        },
      })

      map.addLayer({
        id: 'parcel-outline',
        type: 'line',
        source: 'selected-parcel',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 2,
          'line-dasharray': [2, 1],
        },
      })

      // Initial inspection at default center
      inspectLocation(-31.4201, -64.1888, 10, 'single_axis_tracker')
    })

    // Handle map click for parcel prospecting
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setSelectedCoords({ lat, lon: lng })
      inspectLocation(lat, lng, areaHa, topology)
    })

    const handleResize = () => {
      if (mapRef.current) mapRef.current.resize()
    }
    window.addEventListener('resize', handleResize)
    const t1 = setTimeout(handleResize, 150)
    const t2 = setTimeout(handleResize, 600)
    const t3 = setTimeout(handleResize, 1500)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Updates parcel polygon on map
  const updateParcelPolygon = (lat: number, lon: number, hectares: number) => {
    if (!mapRef.current) return
    const source = mapRef.current.getSource('selected-parcel') as maplibregl.GeoJSONSource
    if (!source) return

    // 1 ha = 10,000 m² -> side in meters
    const sideM = Math.sqrt(hectares * 10000)
    const latDelta = (sideM / 111320) / 2
    const lonDelta = (sideM / (111320 * Math.cos((lat * Math.PI) / 180))) / 2

    const coords = [
      [lon - lonDelta, lat - latDelta],
      [lon + lonDelta, lat - latDelta],
      [lon + lonDelta, lat + latDelta],
      [lon - lonDelta, lat + latDelta],
      [lon - lonDelta, lat - latDelta],
    ]

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: {},
        },
      ],
    })

    // Update marker
    if (markerRef.current) {
      markerRef.current.setLngLat([lon, lat])
    } else {
      const el = document.createElement('div')
      el.className = 'w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg animate-pulse'
      markerRef.current = new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(mapRef.current)
    }
  }

  // Trigger server-side prospecting calculation
  const inspectLocation = async (
    lat: number,
    lon: number,
    ha: number,
    top: SolarFieldTopology
  ) => {
    setLoading(true)
    updateParcelPolygon(lat, lon, ha)

    try {
      const estimatedGti = estimateGtiFromCoords(lat, lon)
      const res = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          areaHa: ha,
          topology: top,
          annualGtiKwhM2: estimatedGti,
        }),
      })

      if (res.ok) {
        const data: ProspectApiResponse = await res.json()
        setProspectData(data)
        if (onProspectResolved) {
          onProspectResolved(data)
        }
      }
    } catch (err) {
      console.error('Error fetching solar prospect:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAreaChange = (ha: number) => {
    setAreaHa(ha)
    if (selectedCoords) {
      inspectLocation(selectedCoords.lat, selectedCoords.lon, ha, topology)
    }
  }

  const handleTopologyChange = (top: SolarFieldTopology) => {
    setTopology(top)
    if (selectedCoords) {
      inspectLocation(selectedCoords.lat, selectedCoords.lon, areaHa, top)
    }
  }

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      {/* Map Canvas */}
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%', minHeight: '650px', position: 'relative' }}
        className="w-full h-full"
      />

      {/* Floating Control Toolbar (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 rounded-xl text-xs text-zinc-200 shadow-xl max-w-sm">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{t.prospecting.toolbarTitle}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">MapLibre GL</span>
        </div>

        {/* Area Presets */}
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1 font-medium">
            {t.prospecting.areaLabel}
          </label>
          <div className="flex gap-1">
            {[5, 10, 25, 50, 100].map((ha) => (
              <button
                key={ha}
                onClick={() => handleAreaChange(ha)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  areaHa === ha
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {ha} ha
              </button>
            ))}
          </div>
        </div>

        {/* Topology Selector */}
        <div>
          <label className="text-[11px] text-zinc-400 block mb-1 font-medium">
            {t.prospecting.topologyLabel}
          </label>
          <div className="flex gap-1">
            {[
              { id: 'single_axis_tracker', label: t.prospecting.topologies.single_axis_tracker },
              { id: 'fixed_tilt', label: t.prospecting.topologies.fixed_tilt },
              { id: 'agrivoltaic', label: t.prospecting.topologies.agrivoltaic },
            ].map((topItem) => (
              <button
                key={topItem.id}
                onClick={() => handleTopologyChange(topItem.id as SolarFieldTopology)}
                className={`px-2 py-1 rounded text-[11px] transition-all ${
                  topology === topItem.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {topItem.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 pt-1">
          {t.prospecting.helperText}
        </p>
      </div>

      {/* Floating HUD Inspection Card (Bottom Left) */}
      {prospectData && (
        <div className="absolute bottom-4 left-4 z-10 p-4 bg-zinc-900/95 backdrop-blur-md border border-amber-500/40 rounded-xl text-zinc-200 shadow-2xl max-w-md animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                {t.prospecting.hud.coordinates}
              </span>
              <span className="font-mono text-xs text-amber-300">
                {selectedCoords?.lat.toFixed(4)}°, {selectedCoords?.lon.toFixed(4)}°
              </span>
            </div>
            {/* Decider 2B Badge */}
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span>{t.prospecting.hud.deciderPrefix}{prospectData.decider.latencyMs}ms</span>
              </span>
              <span className="block text-[9px] text-zinc-400">
                {t.prospecting.hud.frugalSavingsPrefix}{prospectData.meta.frugalSavingsWh.toFixed(3)} Wh
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 my-3 text-center">
            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.prospecting.hud.capacity}</span>
              <span className="text-sm font-bold text-zinc-100">
                {prospectData.valuation.installedCapacityMwp} MWp
              </span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.prospecting.hud.turnkeyCapex}</span>
              <span className="text-sm font-bold text-amber-400">
                ${(prospectData.valuation.turnkeyCapexUsd / 1_000_000).toFixed(2)}M
              </span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.prospecting.hud.payback}</span>
              <span className="text-sm font-bold text-emerald-400">
                {prospectData.valuation.paybackYears} {t.prospecting.hud.years}
              </span>
            </div>
          </div>

          {/* Value Pitch */}
          <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">{t.prospecting.hud.tenYearReturn}</span>{' '}
            +${(prospectData.valuation.tenYearNetReturnUsd / 1_000_000).toFixed(2)}M {t.prospecting.hud.netUsd} (~
            {prospectData.valuation.annualGenerationMwh.toLocaleString()} {t.prospecting.hud.annualGenSuffix}).
          </div>

          {/* Action button to open Bedrock Synthesis */}
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setShowBedrockModal(true)}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t.prospecting.hud.viewProposal}</span>
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-amber-500/40 rounded-full shadow-2xl text-xs text-amber-300">
            <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <span>{t.prospecting.loading}</span>
          </div>
        </div>
      )}

      {/* Bedrock Executive Proposal Modal */}
      {showBedrockModal && prospectData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl text-zinc-200">
            <button
              onClick={() => setShowBedrockModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Amazon Bedrock ({prospectData.bedrock.modelId})
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {t.prospecting.modal.latency}{prospectData.bedrock.llmLatencyMs}ms
              </span>
            </div>

            <h3 className="text-lg font-bold text-amber-400 mt-4">
              {t.prospecting.modal.title}
            </h3>

            <div className="my-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
              {prospectData.bedrock.executiveSummary}
            </div>

            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              {t.prospecting.modal.highlightsTitle}
            </h4>
            <ul className="space-y-1.5 mb-4 text-xs text-zinc-300">
              {prospectData.bedrock.keyHighlights.map((hl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>{hl}</span>
                </li>
              ))}
            </ul>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300 block mb-1">
                {t.prospecting.modal.frugalTitle}
              </span>
              {prospectData.bedrock.frugalAnalysis}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowBedrockModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white"
              >
                {t.prospecting.modal.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
