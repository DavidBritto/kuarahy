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
  // --- South America (Cuyo, NOA, Brazil, Chile, Paraguay) ---
  { id: 'ar-cuyo-1', lat: -31.5375, lon: -68.5364, gtiKwhM2: 2420, commercialScore: 98, gridProximityKm: 4.2, regionName: 'San Juan Solar Valley (AR)' },
  { id: 'ar-cuyo-2', lat: -32.8908, lon: -68.8272, gtiKwhM2: 2280, commercialScore: 92, gridProximityKm: 2.1, regionName: 'Mendoza Norte (AR)' },
  { id: 'ar-noa-1', lat: -24.7821, lon: -65.4232, gtiKwhM2: 2510, commercialScore: 96, gridProximityKm: 8.5, regionName: 'Salta Puna (AR)' },
  { id: 'ar-noa-2', lat: -24.1858, lon: -65.2995, gtiKwhM2: 2560, commercialScore: 99, gridProximityKm: 6.0, regionName: 'Jujuy Cauchari Hub (AR)' },
  { id: 'ar-cba-1', lat: -31.4201, lon: -64.1888, gtiKwhM2: 1980, commercialScore: 88, gridProximityKm: 1.5, regionName: 'Córdoba Agro-Solar (AR)' },
  { id: 'ar-cba-2', lat: -32.4103, lon: -63.2405, gtiKwhM2: 1940, commercialScore: 86, gridProximityKm: 3.0, regionName: 'Villa María (AR)' },
  { id: 'ar-bue-1', lat: -37.3217, lon: -59.1332, gtiKwhM2: 1720, commercialScore: 78, gridProximityKm: 5.0, regionName: 'Tandilia Pampa (AR)' },
  { id: 'ar-bue-2', lat: -38.7183, lon: -62.2663, gtiKwhM2: 1840, commercialScore: 84, gridProximityKm: 2.8, regionName: 'Bahía Blanca Solar (AR)' },
  { id: 'ar-lr-1', lat: -29.4131, lon: -66.8558, gtiKwhM2: 2360, commercialScore: 94, gridProximityKm: 3.5, regionName: 'La Rioja Nonogasta (AR)' },
  { id: 'ar-cat-1', lat: -28.4696, lon: -65.7852, gtiKwhM2: 2390, commercialScore: 95, gridProximityKm: 4.8, regionName: 'Catamarca Valle (AR)' },
  { id: 'cl-ata-1', lat: -23.8634, lon: -69.1328, gtiKwhM2: 2750, commercialScore: 100, gridProximityKm: 9.0, regionName: 'Atacama Desert (CL)' },
  { id: 'py-asu-1', lat: -25.2637, lon: -57.5759, gtiKwhM2: 1890, commercialScore: 85, gridProximityKm: 2.0, regionName: 'Gran Asunción (PY)' },
  { id: 'py-cha-1', lat: -22.3500, lon: -59.8500, gtiKwhM2: 2150, commercialScore: 90, gridProximityKm: 12.0, regionName: 'Chaco Central (PY)' },
  { id: 'br-bah-1', lat: -12.1465, lon: -44.9961, gtiKwhM2: 2210, commercialScore: 93, gridProximityKm: 5.5, regionName: 'Bahia Sertão Hub (BR)' },
  { id: 'br-min-1', lat: -16.7282, lon: -43.8617, gtiKwhM2: 2130, commercialScore: 90, gridProximityKm: 3.8, regionName: 'Minas Gerais Solar Valley (BR)' },

  // --- North America (US Sun Belt & Mexico) ---
  { id: 'us-moj-1', lat: 35.5320, lon: -115.4670, gtiKwhM2: 2420, commercialScore: 98, gridProximityKm: 4.0, regionName: 'Mojave Ivanpah Basin (US-CA)' },
  { id: 'us-son-1', lat: 33.4484, lon: -112.0740, gtiKwhM2: 2380, commercialScore: 96, gridProximityKm: 2.5, regionName: 'Sonoran Phoenix Hub (US-AZ)' },
  { id: 'us-tx-1', lat: 31.8457, lon: -102.3676, gtiKwhM2: 2230, commercialScore: 94, gridProximityKm: 3.2, regionName: 'Permian Solar Corridor (US-TX)' },
  { id: 'us-nv-1', lat: 36.5323, lon: -114.7377, gtiKwhM2: 2390, commercialScore: 95, gridProximityKm: 6.1, regionName: 'Nevada Dry Lake (US-NV)' },
  { id: 'mx-son-1', lat: 31.3012, lon: -113.5350, gtiKwhM2: 2460, commercialScore: 97, gridProximityKm: 5.0, regionName: 'Puerto Peñasco Mega-Solar (MX)' },
  { id: 'mx-coah-1', lat: 25.5428, lon: -103.4068, gtiKwhM2: 2320, commercialScore: 92, gridProximityKm: 4.5, regionName: 'Villanueva Coahuila (MX)' },

  // --- Europe (Iberia & Mediterranean) ---
  { id: 'es-alm-1', lat: 37.0917, lon: -2.3592, gtiKwhM2: 2120, commercialScore: 94, gridProximityKm: 2.8, regionName: 'Almería Solar Platform (ES)' },
  { id: 'es-ext-1', lat: 38.5342, lon: -6.4172, gtiKwhM2: 2010, commercialScore: 91, gridProximityKm: 3.5, regionName: 'Extremadura Núñez de Balboa (ES)' },
  { id: 'it-sic-1', lat: 37.5079, lon: 15.0873, gtiKwhM2: 1960, commercialScore: 89, gridProximityKm: 2.0, regionName: 'Catania Sun Valley (IT)' },
  { id: 'gr-cre-1', lat: 35.2401, lon: 24.8093, gtiKwhM2: 1990, commercialScore: 88, gridProximityKm: 4.0, regionName: 'Crete Solar Basin (GR)' },

  // --- Middle East & North Africa (MENA) ---
  { id: 'ma-noor-1', lat: 30.9989, lon: -6.8624, gtiKwhM2: 2520, commercialScore: 99, gridProximityKm: 5.2, regionName: 'Noor Ouarzazate Complex (MA)' },
  { id: 'eg-ben-1', lat: 24.4539, lon: 32.7417, gtiKwhM2: 2580, commercialScore: 99, gridProximityKm: 3.0, regionName: 'Benban Solar Park Aswan (EG)' },
  { id: 'ae-mbr-1', lat: 24.7538, lon: 55.3621, gtiKwhM2: 2360, commercialScore: 97, gridProximityKm: 2.2, regionName: 'MBR Solar Park Dubai (AE)' },
  { id: 'sa-sud-1', lat: 25.5821, lon: 45.6214, gtiKwhM2: 2490, commercialScore: 98, gridProximityKm: 7.0, regionName: 'Sudair / NEOM Solar Hub (SA)' },

  // --- Sub-Saharan Africa ---
  { id: 'za-nc-1', lat: -28.4572, lon: 21.2425, gtiKwhM2: 2470, commercialScore: 96, gridProximityKm: 4.8, regionName: 'Upington Northern Cape (ZA)' },
  { id: 'na-nam-1', lat: -28.0167, lon: 18.7500, gtiKwhM2: 2540, commercialScore: 95, gridProximityKm: 8.0, regionName: 'Karasburg Namib Belt (NA)' },
  { id: 'ke-tur-1', lat: 2.5000, lon: 36.5000, gtiKwhM2: 2260, commercialScore: 90, gridProximityKm: 14.0, regionName: 'Turkana Rift Hub (KE)' },

  // --- Asia (India & China) ---
  { id: 'in-raj-1', lat: 27.5386, lon: 71.9167, gtiKwhM2: 2430, commercialScore: 98, gridProximityKm: 3.0, regionName: 'Bhadla Solar Park Rajasthan (IN)' },
  { id: 'in-kar-1', lat: 14.1022, lon: 77.2764, gtiKwhM2: 2160, commercialScore: 92, gridProximityKm: 4.0, regionName: 'Pavagada Solar Park (IN)' },
  { id: 'cn-qin-1', lat: 36.1017, lon: 100.6050, gtiKwhM2: 2280, commercialScore: 96, gridProximityKm: 6.5, regionName: 'Gonghe Qinghai Basin (CN)' },
  { id: 'cn-nin-1', lat: 37.5500, lon: 105.0500, gtiKwhM2: 2210, commercialScore: 94, gridProximityKm: 5.0, regionName: 'Tengger Desert Ningxia (CN)' },

  // --- Oceania / Australia ---
  { id: 'au-pil-1', lat: -21.1500, lon: 119.7500, gtiKwhM2: 2560, commercialScore: 97, gridProximityKm: 9.5, regionName: 'Pilbara Sun Corridor (AU-WA)' },
  { id: 'au-qld-1', lat: -27.2000, lon: 150.8000, gtiKwhM2: 2200, commercialScore: 91, gridProximityKm: 3.5, regionName: 'Darling Downs Hub (AU-QLD)' },
  { id: 'au-sa-1', lat: -32.5000, lon: 137.7600, gtiKwhM2: 2290, commercialScore: 93, gridProximityKm: 2.8, regionName: 'Port Augusta Corridor (AU-SA)' },
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
