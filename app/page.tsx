'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Login from './components/Login'
import Welcome from './components/Welcome'
import Features from './components/Features'

type Screen = 'login' | 'welcome' | 'features'

const Page = () => {
  const [screen, setScreen] = useState<Screen>('login')
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // A cached app shell can keep stale chunks alive during local development
      // and break HMR. PWA caching is only enabled for production builds.
      if (process.env.NODE_ENV !== 'production') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister())
        })
        return
      }

      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('WindCast service worker registration failed', error)
      })
    }

    if (!screenRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      gsap.fromTo(
        screenRef.current,
        { autoAlpha: 0, y: prefersReducedMotion ? 0 : 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: prefersReducedMotion ? 0 : 0.55,
          ease: 'power3.out',
          clearProps: 'transform',
        },
      )
    }, screenRef)

    return () => context.revert()
  }, [screen])

  return (
    <main ref={screenRef} className="min-h-screen">
      {screen === 'login' && <Login onContinue={() => setScreen('welcome')} />}
      {screen === 'welcome' && <Welcome onContinue={() => setScreen('features')} />}
      {screen === 'features' && <Features />}
    </main>
  )
}

export default Page
