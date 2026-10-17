import { describe, it, expect } from 'vitest'
import { calculateSolarValuation, TOPOLOGY_PRESETS } from './solar-valuation'

describe('Solar Field Valuation Engine', () => {
  it('throws an error if area is zero or negative', () => {
    expect(() => calculateSolarValuation({ coords: { lat: 0, lon: 0 }, areaHa: 0 })).toThrow(
      'Parcel area must be greater than 0 hectares.'
    )
    expect(() => calculateSolarValuation({ coords: { lat: 0, lon: 0 }, areaHa: -5 })).toThrow(
      'Parcel area must be greater than 0 hectares.'
    )
  })

  it('calculates single-axis tracker valuation accurately for a 10-hectare field', () => {
    const result = calculateSolarValuation({
      coords: { lat: -31.4201, lon: -64.1888 },
      areaHa: 10,
      topology: 'single_axis_tracker',
    })

    expect(result.areaHa).toBe(10)
    expect(result.topology).toBe('single_axis_tracker')
    expect(result.installedCapacityKwp).toBe(6200) // 10 * 620
    expect(result.installedCapacityMwp).toBe(6.2)
    expect(result.turnkeyCapexUsd).toBe(6200 * TOPOLOGY_PRESETS.single_axis_tracker.capexPerKwp)
    expect(result.annualGenerationMwh).toBeGreaterThan(10000)
    expect(result.paybackYears).toBeGreaterThan(2)
    expect(result.paybackYears).toBeLessThan(10)
    expect(result.tenYearNetReturnUsd).toBeGreaterThan(0)
    expect(result.twentyYearNetReturnUsd).toBeGreaterThan(result.tenYearNetReturnUsd)
    expect(result.co2OffsetTonsPerYear).toBeGreaterThan(4000)
    expect(result.summaryPhrase).toContain('10.0 hectáreas con Single-Axis Smart Tracker')
  })

  it('calculates fixed-tilt topology with denser capacity and lower CapEx', () => {
    const result = calculateSolarValuation({
      coords: { lat: 40.4168, lon: -3.7038 },
      areaHa: 5,
      topology: 'fixed_tilt',
    })

    expect(result.installedCapacityKwp).toBe(4250) // 5 * 850
    expect(result.turnkeyCapexUsd).toBe(4250 * TOPOLOGY_PRESETS.fixed_tilt.capexPerKwp)
    expect(result.paybackYears).toBeGreaterThan(2)
    expect(result.paybackYears).toBeLessThan(12)
  })

  it('calculates agrivoltaic dual-use with elevated structure pricing', () => {
    const result = calculateSolarValuation({
      coords: { lat: -25.2637, lon: -57.5759 },
      areaHa: 20,
      topology: 'agrivoltaic',
    })

    expect(result.installedCapacityKwp).toBe(8400) // 20 * 420
    expect(result.turnkeyCapexUsd).toBe(8400 * TOPOLOGY_PRESETS.agrivoltaic.capexPerKwp)
    expect(result.summaryPhrase).toContain('Agrivoltaic Dual-Use')
  })

  it('respects custom tariff and GTI overrides', () => {
    const highTariff = calculateSolarValuation({
      coords: { lat: 0, lon: 0 },
      areaHa: 10,
      annualGtiKwhM2: 2200,
      tariffUsdPerKwh: 0.15, // High commercial rate
    })

    const standard = calculateSolarValuation({
      coords: { lat: 0, lon: 0 },
      areaHa: 10,
      annualGtiKwhM2: 1850,
      tariffUsdPerKwh: 0.085,
    })

    expect(highTariff.annualGrossRevenueUsd).toBeGreaterThan(standard.annualGrossRevenueUsd)
    expect(highTariff.paybackYears).toBeLessThan(standard.paybackYears)
  })
})
