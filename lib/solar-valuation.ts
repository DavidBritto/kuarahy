/**
 * Solaria — Engineering & Financial Valuation Engine
 * 
 * Computes deterministic solar energy production, CapEx, operating costs,
 * and multi-year financial returns per hectare of land.
 * 
 * Standards & Assumptions:
 * - 1 hectare = 10,000 m²
 * - Ground Coverage Ratio (GCR): 0.40 (prevents inter-row shading)
 * - Module Degradation: 0.5% / year (standard Tier 1 N-type TOPCon/HJT)
 * - Performance Ratio (PR): 0.83 (inverter clipping, thermal loss, soiling, AC cabling)
 * - Clean energy displacement: ~0.45 metric tons CO2 / MWh
 */

export type SolarFieldTopology = 'single_axis_tracker' | 'fixed_tilt' | 'agrivoltaic'

export interface ParcelProspectInput {
  coords: { lat: number; lon: number }
  areaHa: number
  topology?: SolarFieldTopology
  annualGtiKwhM2?: number       // Global Tilted Irradiance in kWh/m²/year
  tariffUsdPerKwh?: number      // Wholesale PPA or spot tariff in USD
  customCapexPerKwp?: number    // Turnkey cost per kWp
}

export interface SolarValuationMetrics {
  areaHa: number
  topology: SolarFieldTopology
  installedCapacityKwp: number
  installedCapacityMwp: number
  annualGenerationMwh: number
  turnkeyCapexUsd: number
  annualGrossRevenueUsd: number
  annualOmUsd: number
  annualNetCashflowUsd: number
  paybackYears: number
  tenYearNetReturnUsd: number
  twentyYearNetReturnUsd: number
  co2OffsetTonsPerYear: number
  summaryPhrase: string
}

export const TOPOLOGY_PRESETS = {
  single_axis_tracker: {
    label: 'Single-Axis Smart Tracker',
    kwpPerHectare: 620, // Lower density to accommodate pitch & rotation without shading
    capexPerKwp: 880,   // USD / kWp installed (turnkey EPC + tracker drive)
    omPerKwpYear: 16,   // USD / kWp / year
    trackingYieldMultiplier: 1.22, // +22% yield vs horizontal/fixed
  },
  fixed_tilt: {
    label: 'Fixed-Tilt Optimal Pitch',
    kwpPerHectare: 850, // Denser layout
    capexPerKwp: 750,   // Lower CapEx (no motors/drives)
    omPerKwpYear: 12,
    trackingYieldMultiplier: 1.0,
  },
  agrivoltaic: {
    label: 'Agrivoltaic Dual-Use (Agriculture + Solar)',
    kwpPerHectare: 420, // Elevated racks (2.5m-4m) spaced for tractors/livestock
    capexPerKwp: 1020,  // Higher structural steel & elevated piling
    omPerKwpYear: 18,
    trackingYieldMultiplier: 1.08, // Better bifacial reflection from agricultural ground
  },
} as const

const DEFAULT_ANNUAL_GTI_KWH_M2 = 1850 // Typical sunny latitude baseline
const DEFAULT_TARIFF_USD_PER_KWH = 0.085 // ~$85 / MWh standard PPA
const PERFORMANCE_RATIO = 0.83
const ANNUAL_DEGRADATION = 0.005 // 0.5% per year
const CO2_TONS_PER_MWH = 0.45

/**
 * Calculates complete physical and financial returns for a land parcel.
 */
export function calculateSolarValuation(input: ParcelProspectInput): SolarValuationMetrics {
  if (input.areaHa <= 0) {
    throw new Error('Parcel area must be greater than 0 hectares.')
  }

  const topology: SolarFieldTopology = input.topology ?? 'single_axis_tracker'
  const preset = TOPOLOGY_PRESETS[topology]

  const gti = input.annualGtiKwhM2 && input.annualGtiKwhM2 > 0 ? input.annualGtiKwhM2 : DEFAULT_ANNUAL_GTI_KWH_M2
  const tariff = input.tariffUsdPerKwh && input.tariffUsdPerKwh > 0 ? input.tariffUsdPerKwh : DEFAULT_TARIFF_USD_PER_KWH
  const capexPerKwp = input.customCapexPerKwp && input.customCapexPerKwp > 0 ? input.customCapexPerKwp : preset.capexPerKwp

  // 1. Sizing
  const installedCapacityKwp = Math.round(input.areaHa * preset.kwpPerHectare)
  const installedCapacityMwp = Number((installedCapacityKwp / 1000).toFixed(2))

  // 2. Generation: GTI × PR × TrackerMultiplier
  const specificYieldKwhPerKwp = gti * PERFORMANCE_RATIO * preset.trackingYieldMultiplier
  const annualGenerationKwh = installedCapacityKwp * specificYieldKwhPerKwp
  const annualGenerationMwh = Math.round(annualGenerationKwh / 1000)

  // 3. Costs
  const turnkeyCapexUsd = Math.round(installedCapacityKwp * capexPerKwp)
  const annualOmUsd = Math.round(installedCapacityKwp * preset.omPerKwpYear)

  // 4. Revenues
  const annualGrossRevenueUsd = Math.round(annualGenerationKwh * tariff)
  const annualNetCashflowUsd = Math.max(0, annualGrossRevenueUsd - annualOmUsd)

  // 5. Payback
  const paybackYears = annualNetCashflowUsd > 0
    ? Number((turnkeyCapexUsd / annualNetCashflowUsd).toFixed(1))
    : 99.9

  // 6. Multi-year cumulative cashflows with 0.5% yearly degradation
  let tenYearNetReturnUsd = -turnkeyCapexUsd
  let twentyYearNetReturnUsd = -turnkeyCapexUsd

  for (let year = 1; year <= 20; year++) {
    const degradationFactor = Math.pow(1 - ANNUAL_DEGRADATION, year - 1)
    const yearCashflow = (annualGrossRevenueUsd * degradationFactor) - annualOmUsd
    if (year <= 10) tenYearNetReturnUsd += yearCashflow
    twentyYearNetReturnUsd += yearCashflow
  }

  tenYearNetReturnUsd = Math.round(tenYearNetReturnUsd)
  twentyYearNetReturnUsd = Math.round(twentyYearNetReturnUsd)

  // 7. Carbon Impact
  const co2OffsetTonsPerYear = Math.round(annualGenerationMwh * CO2_TONS_PER_MWH)

  // 8. Human summary phrase for UI/Agent
  const formattedRevenue10Y = (tenYearNetReturnUsd / 1_000_000).toFixed(2)
  const summaryPhrase = `${input.areaHa.toFixed(1)} hectáreas con ${preset.label} pueden generar ~${annualGenerationMwh.toLocaleString()} MWh/año con un retorno neto acumulado de $${formattedRevenue10Y}M USD en 10 años (payback de ${paybackYears} años).`

  return {
    areaHa: input.areaHa,
    topology,
    installedCapacityKwp,
    installedCapacityMwp,
    annualGenerationMwh,
    turnkeyCapexUsd,
    annualGrossRevenueUsd,
    annualOmUsd,
    annualNetCashflowUsd,
    paybackYears,
    tenYearNetReturnUsd,
    twentyYearNetReturnUsd,
    co2OffsetTonsPerYear,
    summaryPhrase,
  }
}
