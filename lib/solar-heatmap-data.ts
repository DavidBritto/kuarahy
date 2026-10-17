/**
 * Solar Radiation & Commercial Potential GeoJSON Dataset
 * 
 * Generates calibrated solar irradiance nodes across high-potential regions
 * for rendering on GPU-accelerated MapLibre GL heatmaps.
 */

export interface SolarDataPoint {
  id: string
  lat: number
  lon: number
  gtiKwhM2: number       // Annual Global Tilted Irradiance (1400 - 2600)
  commercialScore: number // 0 to 100
  gridProximityKm: number
  regionName: string
}

export const SEED_SOLAR_NODES: SolarDataPoint[] = [
  // Cuyo & NOA (Argentina) - World-class solar corridor
  { id: 'ar-cuyo-1', lat: -31.5375, lon: -68.5364, gtiKwhM2: 2420, commercialScore: 98, gridProximityKm: 4.2, regionName: 'San Juan Solar Valley' },
  { id: 'ar-cuyo-2', lat: -32.8908, lon: -68.8272, gtiKwhM2: 2280, commercialScore: 92, gridProximityKm: 2.1, regionName: 'Mendoza Norte' },
  { id: 'ar-noa-1', lat: -24.7821, lon: -65.4232, gtiKwhM2: 2510, commercialScore: 96, gridProximityKm: 8.5, regionName: 'Salta Puna' },
  { id: 'ar-noa-2', lat: -24.1858, lon: -65.2995, gtiKwhM2: 2560, commercialScore: 99, gridProximityKm: 6.0, regionName: 'Jujuy Cauchari Hub' },
  { id: 'ar-cba-1', lat: -31.4201, lon: -64.1888, gtiKwhM2: 1980, commercialScore: 88, gridProximityKm: 1.5, regionName: 'Córdoba Agro-Solar' },
  { id: 'ar-cba-2', lat: -32.4103, lon: -63.2405, gtiKwhM2: 1940, commercialScore: 86, gridProximityKm: 3.0, regionName: 'Villa María' },
  { id: 'ar-bue-1', lat: -37.3217, lon: -59.1332, gtiKwhM2: 1720, commercialScore: 78, gridProximityKm: 5.0, regionName: 'Tandilia Pampa' },
  { id: 'ar-bue-2', lat: -38.7183, lon: -62.2663, gtiKwhM2: 1840, commercialScore: 84, gridProximityKm: 2.8, regionName: 'Bahía Blanca Solar' },
  { id: 'ar-lr-1', lat: -29.4131, lon: -66.8558, gtiKwhM2: 2360, commercialScore: 94, gridProximityKm: 3.5, regionName: 'La Rioja Nonogasta' },
  { id: 'ar-cat-1', lat: -28.4696, lon: -65.7852, gtiKwhM2: 2390, commercialScore: 95, gridProximityKm: 4.8, regionName: 'Catamarca Valle' },

  // Paraguay & Brazil border
  { id: 'py-asu-1', lat: -25.2637, lon: -57.5759, gtiKwhM2: 1890, commercialScore: 85, gridProximityKm: 2.0, regionName: 'Gran Asunción' },
  { id: 'py-cha-1', lat: -22.3500, lon: -59.8500, gtiKwhM2: 2150, commercialScore: 90, gridProximityKm: 12.0, regionName: 'Chaco Central' },

  // Chile - Atacama peak
  { id: 'cl-ata-1', lat: -23.8634, lon: -69.1328, gtiKwhM2: 2750, commercialScore: 100, gridProximityKm: 9.0, regionName: 'Atacama Desert' },
]

/**
 * Returns a dense GeoJSON FeatureCollection for MapLibre GL heatmap rendering.
 */
export function getSolarHeatmapGeoJSON(): GeoJSON.FeatureCollection<GeoJSON.Point> {
  // Generate surrounding grid points around seed nodes to produce a continuous heat gradient
  const features: GeoJSON.Feature<GeoJSON.Point>[] = []

  for (const node of SEED_SOLAR_NODES) {
    // Center point
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [node.lon, node.lat] },
      properties: {
        gti: node.gtiKwhM2,
        commercialScore: node.commercialScore,
        intensity: node.commercialScore / 100,
        regionName: node.regionName,
      },
    })

    // Halo points for natural geographic dispersion
    const offsets = [
      [-0.15, -0.1], [0.15, -0.1], [-0.1, 0.15], [0.1, 0.15],
      [-0.25, 0], [0.25, 0], [0, -0.2], [0, 0.2],
    ]
    for (const [dLon, dLat] of offsets) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [node.lon + dLon, node.lat + dLat] },
        properties: {
          gti: node.gtiKwhM2 * 0.95,
          commercialScore: Math.round(node.commercialScore * 0.92),
          intensity: (node.commercialScore * 0.92) / 100,
          regionName: node.regionName,
        },
      })
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}

/**
 * Heuristically estimates annual GTI (kWh/m²/year) from coordinates if not directly sampled.
 */
export function estimateGtiFromCoords(lat: number, _lon: number): number {
  // Latitudinal solar insolance baseline
  const absLat = Math.abs(lat)
  if (absLat < 15) return 2100
  if (absLat <= 32) return 2350 - (absLat - 15) * 15 // Prime sub-tropical sun belt (Cuyo/Atacama/Sahara)
  if (absLat <= 45) return 1950 - (absLat - 32) * 30 // Temperate zone
  return Math.max(1200, 1550 - (absLat - 45) * 45)   // High latitude
}
