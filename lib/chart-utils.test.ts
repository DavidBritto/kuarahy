/**
 * lib/chart-utils.test.ts
 *
 * Property-based tests para las funciones puras de lib/chart-utils.ts.
 */

import { describe, it } from 'vitest'
import fc from 'fast-check'

import { splitTraveled } from './chart-utils'
import type { HourlyPoint } from './types'

/**
 * Construye un HourlyPoint "fake" válido con el `ts` indicado y el resto de
 * campos rellenos con valores dummy (0), suficientes para satisfacer el tipo
 * real de lib/types.ts sin necesidad de física solar real.
 */
function buildFakeHourlyPoint(ts: number): HourlyPoint {
  return {
    ts,
    sun: { ts, elevation: 0, azimuth: 0 },
    ghi: 0,
    dni: 0,
    dhi: 0,
    poa: 0,
    gtiApi: null,
    cosIncidence: 0,
    cloudCover: 0,
    temperature: 0,
    powerKw: 0,
    powerOptimalKw: 0,
  }
}

/** Generador de `ts`: incluye enteros normales y valores no finitos (NaN/Infinity). */
const tsArbitrary = fc.oneof(
  fc.integer(),
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity)
)

const pointsArbitrary = fc.array(tsArbitrary.map(buildFakeHourlyPoint))

const nowTsArbitrary = fc.oneof(
  fc.integer(),
  fc.constant(NaN),
  fc.constant(Infinity),
  fc.constant(-Infinity),
  fc.constant(0)
)

describe('splitTraveled - Correctness Property 5', () => {
  it('preserva la longitud: traveled.length + remaining.length === points.length', () => {
    fc.assert(
      fc.property(pointsArbitrary, nowTsArbitrary, (points, nowTs) => {
        const { traveled, remaining } = splitTraveled(points, nowTs)
        return traveled.length + remaining.length === points.length
      })
    )
  })
})

/** Validates: Requirements 1.1, 1.2 */
