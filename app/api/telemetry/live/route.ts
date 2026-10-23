import { NextRequest, NextResponse } from 'next/server'
import { fetchLiveSolarTelemetry } from '@/lib/open-meteo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = Number(searchParams.get('lat') ?? -31.42)
    const lon = Number(searchParams.get('lon') ?? -64.19)

    const telemetry = await fetchLiveSolarTelemetry(lat, lon)
    return NextResponse.json(telemetry)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown telemetry error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
