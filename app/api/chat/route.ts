import { NextRequest, NextResponse } from 'next/server'

const backendBase = (process.env.WINDCAST_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null)
  const question = (body as { question?: unknown } | null)?.question
  if (typeof question !== 'string' || !question.trim()) return NextResponse.json({ error: 'question is required' }, { status: 400 })
  if (question.length > 1000) return NextResponse.json({ error: 'question must be 1000 characters or fewer' }, { status: 400 })

  try {
    const response = await fetch(`${backendBase}/api/v1/public/assistant/`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() }),
      cache: 'no-store',
    })
    const result: unknown = await response.json()
    if (!response.ok) {
      const error = (result as { detail?: string; error?: string })?.detail ?? (result as { error?: string })?.error
      return NextResponse.json({ error: error ?? 'WindCast backend assistant is unavailable.' }, { status: response.status })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('WindCast assistant backend request failed', error)
    return NextResponse.json({ error: 'WindCast backend is unavailable. Start the Django API on port 8000.' }, { status: 502 })
  }
}
