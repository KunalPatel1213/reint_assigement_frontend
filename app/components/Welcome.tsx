'use client';

import React from 'react'
import Image from 'next/image'

type WelcomeProps = {
  onContinue: () => void
}

const Welcome = ({ onContinue }: WelcomeProps) => {
  return (
    <div className="h-[100dvh] w-full flex justify-center bg-[#020b17] text-white font-['Poppins',sans-serif] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-160px] left-1/2 -translate-x-1/2 w-[420px] h-[320px] bg-blue-700/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Screen container */}
      <div className="relative z-10 w-full max-w-[420px] h-full flex flex-col px-5 py-5 overflow-y-auto">

        {/* Main group: logo + title + content, centered together */}
        <div className="flex-1 flex flex-col justify-center gap-4">

          {/* Logo & Title */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo.png"
              alt="WindCast Logo"
              width={80}
              height={80}
              className="w-20 h-20 max-[740px]:w-16 max-[740px]:h-16 object-contain mb-3 drop-shadow-[0_8px_24px_rgba(34,211,238,0.45)]"
            />
            <h1 className="text-2xl max-[740px]:text-xl font-bold tracking-wide">Welcome</h1>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 max-[740px]:gap-2 text-[12.5px] max-[740px]:text-[12px] leading-snug text-slate-300">
            <p>
              <span className="text-cyan-400 font-semibold">WindCast</span> is an
              analytics platform designed for UK energy trading teams to optimize
              day-ahead power purchasing.
            </p>

            <p className="text-slate-400">
              Access wind generation forecasts, analyze historical accuracy, and
              plan safer day-ahead bidding decisions.
            </p>

            {/* Bullet box */}
            <div className="rounded-2xl border border-cyan-900/60 bg-slate-900/50 p-3.5 max-[740px]:p-3">
              <ul className="space-y-2.5 max-[740px]:space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 text-base leading-none mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-100">Latest Day-Ahead Forecast:</strong>{' '}
                    View the latest published GB wind generation forecast from
                    Elexon BMRS.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 text-base leading-none mt-0.5">•</span>
                  <span>
                    <strong className="text-slate-100">Accuracy &amp; Error Metrics:</strong>{' '}
                    Accuracy metrics appear when matching actual generation data
                    is available.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 shrink-0 pt-4">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3 max-[740px]:py-2.5 rounded-full border border-cyan-400/40 bg-gradient-to-b from-cyan-700/70 to-teal-900/80 text-white font-semibold text-sm shadow-[0_0_24px_rgba(34,211,238,0.25)] hover:from-cyan-600/80 hover:to-teal-800/80 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Continue
          </button>

          <p className="text-[10.5px] text-slate-500 text-center leading-tight">
            Day-Ahead Wind Forecast &amp; <br /> Accuracy Analytics for Energy Trading
          </p>
        </div>
      </div>
    </div>
  )
}

export default Welcome
