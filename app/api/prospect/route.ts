import { NextRequest, NextResponse } from 'next/server'
import { KuarahySolarDecider, type KuarahyAgentState } from '@/lib/agent/decider-tool-selection'
import { calculateSolarValuation, type SolarFieldTopology } from '@/lib/solar-valuation'
import { generateBedrockProspectingSummary } from '@/lib/agent/bedrock-financial-model'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lat = Number(body.lat ?? -31.4201)
    const lon = Number(body.lon ?? -64.1888)
    const areaHa = Number(body.areaHa ?? 10)
    const topology = (body.topology as SolarFieldTopology) || 'single_axis_tracker'

    if (areaHa <= 0) {
      return NextResponse.json({ error: 'El área debe ser mayor a 0 hectáreas.' }, { status: 400 })
    }

    // Step 1: Strands Decider 2B Tool Selection (<115ms)
    const decider = new KuarahySolarDecider()
    const agentState: KuarahyAgentState = {
      mode: 'prospecting',
      coords: { lat, lon },
      areaHa,
      windSpeedKmh: Number(body.windSpeedKmh ?? 15),
      tariffPriceUsdPerKwh: Number(body.tariffPriceUsdPerKwh ?? 0.085),
    }

    const deciderDecision = await decider.evaluate(agentState)

    // Step 2: Solar Engineering & Financial Calculation
    const valuation = calculateSolarValuation({
      coords: { lat, lon },
      areaHa,
      topology,
      annualGtiKwhM2: body.annualGtiKwhM2,
      tariffUsdPerKwh: body.tariffPriceUsdPerKwh,
    })

    // Step 3: Amazon Bedrock Executive Proposal Synthesis
    const bedrockReport = await generateBedrockProspectingSummary({
      metrics: valuation,
      coords: { lat, lon },
      deciderLatencyMs: deciderDecision.latencyMs,
    })

    return NextResponse.json({
      success: true,
      decider: deciderDecision,
      valuation,
      bedrock: bedrockReport,
      meta: {
        timestamp: Date.now(),
        frugalSavingsWh: 0.24 - deciderDecision.whEstimated,
        frugalLatencySavingsMs: 1800 - deciderDecision.latencyMs,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar la prospección solar'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
