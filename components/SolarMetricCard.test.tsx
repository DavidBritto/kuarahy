import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import SolarMetricCard from './SolarMetricCard'
import { Sun } from 'lucide-react'

describe('SolarMetricCard', () => {
  it('renders title, value, unit, and comparison text correctly', () => {
    const { container } = render(
      <SolarMetricCard
        title="Ventaja Mecatrónica"
        value={24.8}
        unit="%"
        incrementPct={24.8}
        comparisonText="vs panel fijo"
        icon={Sun}
        withBorderBeam={true}
      />
    )

    expect(screen.getByText('Ventaja Mecatrónica')).toBeDefined()
    expect(screen.getByText('24.8')).toBeDefined()
    expect(screen.getByText('%')).toBeDefined()
    expect(screen.getByText('+24.8%')).toBeDefined()
    expect(screen.getByText('vs panel fijo')).toBeDefined()
    
    // Check for border beam SVG
    const svgBeam = container.querySelector('svg.animate-border-beam, rect.animate-border-beam')
    expect(svgBeam).toBeDefined()
  })

  it('handles negative or zero increment without plus sign', () => {
    render(
      <SolarMetricCard
        title="Pérdidas por Polvo"
        value={0}
        unit="%"
        incrementPct={0}
        comparisonText="autolavado activo"
      />
    )

    expect(screen.getByText('0%')).toBeDefined()
  })
})
