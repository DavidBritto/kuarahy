import { describe, it, expect } from 'vitest'
import {
  SEED_SOLAR_NODES,
  getSolarHeatmapGeoJSON,
  estimateGtiFromCoords,
} from './solar-heatmap-data'

describe('solar-heatmap-data', () => {
  it('contains global seed nodes across multiple continents', () => {
    expect(SEED_SOLAR_NODES.length).toBeGreaterThanOrEqual(25)

    // Verify geographical spread
    const hasSouthAmerica = SEED_SOLAR_NODES.some((n) => n.id.startsWith('ar-') || n.id.startsWith('br-') || n.id.startsWith('cl-'))
    const hasNorthAmerica = SEED_SOLAR_NODES.some((n) => n.id.startsWith('us-') || n.id.startsWith('mx-'))
    const hasEurope = SEED_SOLAR_NODES.some((n) => n.id.startsWith('es-') || n.id.startsWith('it-') || n.id.startsWith('gr-'))
    const hasMenaOrAfrica = SEED_SOLAR_NODES.some((n) => n.id.startsWith('ma-') || n.id.startsWith('eg-') || n.id.startsWith('za-'))
    const hasAsia = SEED_SOLAR_NODES.some((n) => n.id.startsWith('in-') || n.id.startsWith('cn-'))
    const hasOceania = SEED_SOLAR_NODES.some((n) => n.id.startsWith('au-'))

    expect(hasSouthAmerica).toBe(true)
    expect(hasNorthAmerica).toBe(true)
    expect(hasEurope).toBe(true)
    expect(hasMenaOrAfrica).toBe(true)
    expect(hasAsia).toBe(true)
    expect(hasOceania).toBe(true)
  })

  it('validates physical and commercial properties for every seed node', () => {
    const ids = new Set<string>()

    for (const node of SEED_SOLAR_NODES) {
      expect(ids.has(node.id)).toBe(false)
      ids.add(node.id)

      expect(node.lat).toBeGreaterThanOrEqual(-90)
      expect(node.lat).toBeLessThanOrEqual(90)
      expect(node.lon).toBeGreaterThanOrEqual(-180)
      expect(node.lon).toBeLessThanOrEqual(180)
      expect(node.gtiKwhM2).toBeGreaterThanOrEqual(1400)
      expect(node.gtiKwhM2).toBeLessThanOrEqual(3000)
      expect(node.commercialScore).toBeGreaterThanOrEqual(0)
      expect(node.commercialScore).toBeLessThanOrEqual(100)
      expect(node.gridProximityKm).toBeGreaterThan(0)
      expect(node.regionName.length).toBeGreaterThan(3)
    }
  })

  it('generates a dense GeoJSON FeatureCollection with halo points', () => {
    const geojson = getSolarHeatmapGeoJSON()

    expect(geojson.type).toBe('FeatureCollection')
    expect(geojson.features.length).toBe(SEED_SOLAR_NODES.length * 9) // 1 center + 8 halo points per node

    for (const feature of geojson.features) {
      expect(feature.type).toBe('Feature')
      expect(feature.geometry.type).toBe('Point')
      expect(feature.geometry.coordinates).toHaveLength(2)
      expect(feature.properties).toHaveProperty('gti')
      expect(feature.properties).toHaveProperty('commercialScore')
      expect(feature.properties).toHaveProperty('intensity')
      expect(feature.properties?.intensity).toBeGreaterThan(0)
      expect(feature.properties?.intensity).toBeLessThanOrEqual(1)
    }
  })

  it('estimates GTI correctly across different latitudinal belts', () => {
    // Equatorial zone (|lat| < 15)
    expect(estimateGtiFromCoords(0, 0)).toBe(2100)
    expect(estimateGtiFromCoords(10, 20)).toBe(2100)

    // Prime sub-tropical sun belt (15 <= |lat| <= 32)
    expect(estimateGtiFromCoords(23.5, 0)).toBeCloseTo(2222.5, 0)
    expect(estimateGtiFromCoords(-30, -68)).toBeCloseTo(2125, 0)

    // Temperate zone (32 < |lat| <= 45)
    expect(estimateGtiFromCoords(40, -3)).toBeCloseTo(1710, 0)

    // High latitude (|lat| > 45)
    expect(estimateGtiFromCoords(60, 10)).toBe(1200)
  })
})
