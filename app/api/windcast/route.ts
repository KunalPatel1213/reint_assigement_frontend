import { NextRequest, NextResponse } from 'next/server'

const backendBase = (process.env.WINDCAST_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  const url = new URL(`${backendBase}/api/v1/public/windcast/`)
  if (date) url.searchParams.set('date', date)

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    const body: unknown = await response.json()
    if (!response.ok) {
      const error = (body as { detail?: string; error?: string })?.detail ?? (body as { error?: string })?.error
      return NextResponse.json({ error: error ?? 'WindCast backend could not load live forecast data.' }, { status: response.status })
    }
    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } })
  } catch (error) {
    console.error('WindCast backend request failed', error)
    return NextResponse.json({ error: 'WindCast backend is unavailable. Start the Django API on port 8000.' }, { status: 502 })
  }
}
