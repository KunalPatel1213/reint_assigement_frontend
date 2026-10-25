'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

type ForecastSlot = { period: number; time: string | null; forecastMW: number; publishedAt: string | null }
type ForecastData = {
  date: string
  source: string
  updatedAt: string | null
  periods: ForecastSlot[]
  summary: { peakMW: number; peakPeriod: number; peakTime?: string; averageMW: number; periods: number; resolutionMinutes?: number } | null
  message?: string
  error?: string
}
type PerformanceData = {
  actualAverageMW: number | null
  actualPeriods: number
  accuracy: { mapePercent: number | null; maeMW: number | null; biasMW: number | null; matchedPeriods: number }
}

function ukDate(offset = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const date = new Date(`${parts}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

function periodTime(period: number) {
  const start = (period - 1) * 30
  const end = start + 30
  const fmt = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return `${fmt(start)} - ${fmt(end)}`
}

const CircleMetric = ({
  value,
  label,
  detail,
  color = 'cyan',
}: {
  value: string
  label: string
  detail: string
  color?: 'cyan' | 'emerald' | 'amber'
}) => {
  const colors = {
    cyan: 'border-cyan-400 text-cyan-300 shadow-cyan-500/20',
    emerald: 'border-emerald-400 text-emerald-300 shadow-emerald-500/20',
    amber: 'border-amber-400 text-amber-300 shadow-amber-500/20',
  }

  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className={`flex h-20 w-20 items-center justify-center rounded-full border-[5px] bg-slate-950/80 shadow-lg sm:h-28 sm:w-28 sm:border-[7px] ${colors[color]}`}>
        <span className="text-lg font-extrabold sm:text-2xl">{value}</span>
      </div>
      <strong className="mt-3 text-sm text-slate-100">{label}</strong>
      <span className="mt-1 text-xs text-slate-500">{detail}</span>
    </div>
  )
}

const Features = () => {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loadingForecast, setLoadingForecast] = useState(true)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [isPredictionOpen, setIsPredictionOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([
    { from: 'assistant', text: 'Hi! Ask me about tomorrow’s forecast, confidence, or procurement action.' },
  ])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/windcast?date=${ukDate(1)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? 'Forecast could not be loaded')
        setForecast(result)
      })
      .catch((error: unknown) => { if (!controller.signal.aborted) setForecast({ date: ukDate(1), source: 'Elexon BMRS WINDFOR', updatedAt: null, periods: [], summary: null, error: error instanceof Error ? error.message : 'Forecast could not be loaded' }) })
      .finally(() => { if (!controller.signal.aborted) setLoadingForecast(false) })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/performance?date=${ukDate()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? 'Performance data could not be loaded')
        setPerformance(result)
      })
      .catch(() => { if (!controller.signal.aborted) setPerformance(null) })
    return () => controller.abort()
  }, [])

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    setMessage('')
    setMessages((current) => [...current, { from: 'user', text: trimmedMessage }])
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: trimmedMessage }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Assistant request failed')
      setMessages((current) => [...current, { from: 'assistant', text: result.answer }])
    } catch {
      setMessages((current) => [...current, { from: 'assistant', text: 'Live forecast data is temporarily unavailable. Please try again shortly.' }])
    }
  }

  const slots = forecast?.periods ?? []
  const summary = forecast?.summary

  return (
    <div className="min-h-screen bg-[#020b17] px-4 py-5 font-sans text-slate-100 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <header className="mb-6 flex min-w-0 flex-col items-stretch gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 shadow-lg shadow-cyan-950/30">
              <Image src="/logo.png" alt="WindCast logo" width={42} height={42} className="h-10 w-10 object-contain" priority />
            </div>
            <div className="min-w-0">
              <div className="min-w-0">
                <h1 className="truncate whitespace-nowrap text-lg font-bold leading-tight tracking-tight text-white sm:text-xl md:text-2xl">WindCast Forecast Intelligence</h1>
                <p className="mt-1 truncate whitespace-nowrap text-xs leading-relaxed text-slate-400 md:text-sm">Live wind forecasting &amp; trading insights</p>
              </div>
            </div>
          </div>
          <div className="flex w-fit max-w-full shrink-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
            <Clock3 className="text-emerald-400" size={16} />
            <span className="text-xs text-slate-300">{loadingForecast ? 'Loading live data…' : forecast?.updatedAt ? `Elexon update ${new Date(forecast.updatedAt).toLocaleString('en-GB', { timeZone: 'Europe/London' })} UK` : 'Elexon live feed'}</span>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <span className="text-xs text-slate-500">Peak forecast</span>
            <strong className="mt-1 block text-xl text-emerald-300">{loadingForecast ? '…' : summary ? `${summary.peakMW.toLocaleString()} MW` : 'Unavailable'}</strong>
            <span className="text-xs text-slate-500">{summary ? summary.peakTime ?? periodTime(summary.peakPeriod) : 'Tomorrow'}</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <span className="text-xs text-slate-500">Expected average</span>
            <strong className="mt-1 block text-xl text-cyan-300">{loadingForecast ? '…' : summary ? `${summary.averageMW.toLocaleString()} MW` : 'Unavailable'}</strong>
            <span className="text-xs text-slate-500">{forecast?.date ?? 'Tomorrow'} average</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <span className="text-xs text-slate-500">Forecast coverage</span>
            <strong className="mt-1 block text-xl text-emerald-300">{summary ? `${summary.periods}` : '—'}</strong>
            <span className="text-xs text-slate-500">Published forecast periods</span>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
            <span className="text-xs text-slate-500">Recommended buffer</span>
            <strong className="mt-1 block text-xl text-amber-300">—</strong>
            <span className="text-xs text-slate-500">No reserve model configured</span>
          </div>
        </div>

        <div className="mb-6 grid gap-5 lg:grid-cols-3">
          <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-slate-900 p-5 shadow-xl shadow-cyan-950/20">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <span className="mb-2 inline-flex rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">FEATURE 01</span>
                <h2 className="text-lg font-bold text-white">Day-ahead prediction</h2>
                <p className="mt-1 text-sm text-slate-400">Tomorrow’s generation forecast, slot by slot.</p>
              </div>
              <Calendar className="text-cyan-300" size={22} />
            </div>
            <div className="mb-6 grid grid-cols-3 gap-2">
              <CircleMetric value={summary ? `${summary.peakMW}` : '—'} label="Peak forecast" detail="MW" color="cyan" />
              <CircleMetric value={summary ? `${summary.averageMW}` : '—'} label="Daily average" detail="MW" color="emerald" />
              <CircleMetric value={summary ? `${summary.periods}` : '—'} label="Data points" detail="published" color="amber" />
            </div>
            <button type="button" onClick={() => setIsPredictionOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
              Open full prediction <ChevronRight size={17} />
            </button>
          </section>

          <section className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-slate-900 to-slate-900 p-5 shadow-xl shadow-emerald-950/20">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <span className="mb-2 inline-flex rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">FEATURE 02</span>
                <h2 className="text-lg font-bold text-white">Accuracy & reliability</h2>
                <p className="mt-1 text-sm text-slate-400">Know how safe the forecast is before bidding.</p>
              </div>
              <BarChart3 className="text-emerald-300" size={22} />
            </div>
            <div className="mb-6 grid grid-cols-3 gap-2">
              <CircleMetric value={performance?.accuracy.mapePercent != null ? `${performance.accuracy.mapePercent}%` : '—'} label="MAPE" detail={performance?.accuracy.matchedPeriods ? `${performance.accuracy.matchedPeriods} matched periods` : 'Waiting for actuals'} color="emerald" />
              <CircleMetric value={performance?.accuracy.maeMW != null ? `${performance.accuracy.maeMW}` : '—'} label="MAE" detail={performance?.accuracy.matchedPeriods ? `MW · ${performance.accuracy.matchedPeriods} periods` : 'Waiting for actuals'} color="cyan" />
              <CircleMetric value={performance?.accuracy.biasMW != null ? `${performance.accuracy.biasMW}` : '—'} label="Bias" detail={performance?.accuracy.matchedPeriods ? `MW · ${performance.accuracy.matchedPeriods} periods` : 'Waiting for actuals'} color="amber" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-slate-300">
              <ShieldCheck className="shrink-0 text-amber-300" size={19} />
              <span>Accuracy compares published wind forecasts with Elexon actual generation. Reserve advice needs a procurement model.</span>
            </div>
          </section>

          <section className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-slate-900 to-slate-900 p-5 shadow-xl shadow-amber-950/20">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <span className="mb-2 inline-flex rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">FEATURE 03</span>
                <h2 className="text-lg font-bold text-white">Today → tomorrow</h2>
                <p className="mt-1 text-sm text-slate-400">Uses today’s trend to estimate the next day.</p>
              </div>
              <Sparkles className="text-amber-300" size={22} />
            </div>
            <div className="mb-6 flex items-center justify-center gap-3 sm:gap-5">
              <div className="text-center">
                <span className="text-xs text-slate-500">Today actual</span>
                <strong className="mt-1 block text-2xl text-slate-100">{performance?.actualAverageMW != null ? `${performance.actualAverageMW.toLocaleString()} MW` : '—'}</strong>
              </div>
              <ChevronRight className="text-amber-300" size={20} />
              <div className="text-center">
                <span className="text-xs text-slate-500">Tomorrow guess</span>
                <strong className="mt-1 block text-2xl text-amber-300">{summary ? `${summary.averageMW} MW` : '—'}</strong>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-400/20 bg-slate-950/40 px-3 py-2 text-xs">
              <span className="text-slate-400">Expected change</span>
              <strong className="text-emerald-300">Live Elexon</strong>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">Official GB system wind forecast. Historical actuals are not used to fabricate confidence or accuracy.</p>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{forecast?.date ?? 'Tomorrow'} at a glance</h2>
              <p className="text-sm text-slate-400">{forecast?.source ?? 'Elexon BMRS'} · GB wind generation forecast</p>
            </div>
            <CheckCircle2 className="text-emerald-400" size={21} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {loadingForecast ? <p className="col-span-full text-sm text-slate-400">Fetching live wind forecast from Elexon…</p> : slots.length ? [...slots].sort((a, b) => b.forecastMW - a.forecastMW).slice(0, 5).sort((a, b) => a.period - b.period).map((slot) => (
              <div key={slot.period} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <span className="text-[11px] text-slate-500">{slot.time ?? periodTime(slot.period)}</span>
                <strong className="mt-1 block text-lg text-cyan-300">{slot.forecastMW} MW</strong>
                <span className="text-[11px] text-slate-400">Settlement period {slot.period}</span>
              </div>
            )) : <p className="col-span-full text-sm text-amber-200">{forecast?.error ?? forecast?.message ?? 'No forecast periods available.'}</p>}
          </div>
        </section>
      </div>

      {isPredictionOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-sm md:items-center">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-cyan-400/20 bg-[#071525] p-5 shadow-2xl shadow-cyan-950/50 md:p-7">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Prediction detail</span>
                <h2 className="mt-1 text-2xl font-bold text-white">Full day-ahead generation plan</h2>
              </div>
              <button type="button" aria-label="Close prediction" onClick={() => setIsPredictionOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={19} /></button>
            </div>
              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <CircleMetric value="—" label="Confidence" detail="Not provided by source" color="emerald" />
              <CircleMetric value={summary ? `${summary.peakMW}` : '—'} label="Peak MW" detail={summary ? summary.peakTime ?? periodTime(summary.peakPeriod) : 'No data'} color="cyan" />
              <CircleMetric value="—" label="Reserve MW" detail="Not configured" color="amber" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              {slots.map((slot) => (
                <div key={slot.period} className="grid gap-1 border-b border-slate-800 px-4 py-3 text-sm last:border-0 sm:grid-cols-[1.2fr_0.8fr_0.8fr] sm:items-center">
                  <span className="min-w-0 break-words text-slate-300">{slot.time ?? periodTime(slot.period)}<small className="ml-2 text-xs text-slate-500">Period {slot.period}</small></span>
                  <strong className="text-cyan-300">{slot.forecastMW} MW</strong>
                  <span className="text-right text-slate-500">No actual data</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {isAssistantOpen && (
          <div className="flex h-[min(520px,calc(100vh-120px))] w-[min(360px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#071525]/95 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2"><Sparkles className="text-cyan-300" size={17} /><strong className="text-sm">WindCast Assistant</strong></div>
              <button type="button" aria-label="Close assistant" onClick={() => setIsAssistantOpen(false)} className="text-slate-400 hover:text-white"><X size={17} /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((item, index) => (
                <div key={`${item.from}-${index}`} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${item.from === 'user' ? 'ml-auto bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-200'}`}>{item.text}</div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-800 p-3">
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about the forecast..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" />
              <button type="submit" aria-label="Send message" className="rounded-xl bg-cyan-400 px-3 text-slate-950 hover:bg-cyan-300"><Send size={17} /></button>
            </form>
          </div>
        )}
        <button type="button" aria-label={isAssistantOpen ? 'Close assistant' : 'Open assistant'} aria-expanded={isAssistantOpen} onClick={() => setIsAssistantOpen((open) => !open)} className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:scale-105 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300">
          {isAssistantOpen ? <X size={23} /> : <MessageCircle size={23} />}
        </button>
      </div>
    </div>
  )
}

export default Features
