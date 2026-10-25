import React from 'react'
import Image from 'next/image'

type LoginProps = {
  onContinue: () => void
}

const Login = ({ onContinue }: LoginProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030914] text-white font-['Poppins',sans-serif] relative overflow-hidden">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center justify-between min-h-[600px]">
        
        {/* Top Spacer */}
        <div className="w-full" />

        {/* Logo & Brand Title */}
        <div className="flex flex-col items-center text-center my-auto">
          {/* Logo Box */}
          <div className="w-28 h-28 mb-6 flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <Image
              src="/logo.png"
              alt="WindCast Logo" 
              width={112}
              height={112}
              className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(56,189,248,0.3)]"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-wider flex items-center gap-2">
            <span className="text-white">Wind</span>
            <span className="text-sky-400">Cast</span>
          </h1>
        </div>

        {/* Action & Tagline */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">
          {/* Prototype entry button; authentication is not configured */}
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 px-6 rounded-full border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-sky-500/50 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg"
          >
            <span className="text-sm font-medium cursor-pointer text-slate-200 group-hover:text-white transition-colors">
              Continue
            </span>
          </button>

          {/* Business Use-Case Oriented Tagline */}
          <p className="text-xs text-slate-400/80 text-center tracking-wide leading-relaxed">
            Day-Ahead Wind Forecast & <br /> Accuracy Analytics for Energy Trading
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login
