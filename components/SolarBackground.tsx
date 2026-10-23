'use client'

import React, { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export default function SolarBackground() {
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  // Spring physics for smooth magnetic follow without latency lag
  const springX = useSpring(mouseX, { stiffness: 45, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 45, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 192)
      mouseY.set(e.clientY - 192)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-black">
      {/* 0. Magnetic Cursor Glow (Follows mouse smoothly) */}
      <motion.div
        className="pointer-events-none fixed w-96 h-96 rounded-full blur-[90px] -z-10"
        style={{
          x: springX,
          y: springY,
          backgroundImage:
            'radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, rgba(251, 191, 36, 0.1) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* 1. Radiant Solar Aura (Top center glow like the sun beyond the horizon) */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent blur-[140px] animate-pulse-glow"
        aria-hidden="true"
      />

      {/* 2. Secondary subtle ambient rim glow on right and left */}
      <div 
        className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-orange-600/5 blur-[120px]"
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]"
        aria-hidden="true"
      />

      {/* 3. Subtle Technical Grid Pattern with Radial Gradient Mask */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(rgba(251, 146, 60, 0.4) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 15%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 15%, black 40%, transparent 90%)',
        }}
        aria-hidden="true"
      />

      {/* 4. Floating Solar Dust / Photons */}
      <div className="absolute inset-0 animate-float-dust-slow opacity-60">
        <span className="absolute top-[12%] left-[18%] w-1 h-1 rounded-full bg-orange-400/80 shadow-[0_0_8px_#f97316]" />
        <span className="absolute top-[28%] left-[72%] w-1.5 h-1.5 rounded-full bg-amber-300/70 shadow-[0_0_10px_#fbbf24]" />
        <span className="absolute top-[45%] left-[34%] w-1 h-1 rounded-full bg-orange-300/60 shadow-[0_0_6px_#f97316]" />
        <span className="absolute top-[65%] left-[82%] w-1 h-1 rounded-full bg-amber-400/50 shadow-[0_0_8px_#fbbf24]" />
      </div>
      <div className="absolute inset-0 animate-float-dust-fast opacity-50">
        <span className="absolute top-[22%] left-[48%] w-1 h-1 rounded-full bg-amber-200/90 shadow-[0_0_8px_#fef08a]" />
        <span className="absolute top-[52%] left-[12%] w-1.5 h-1.5 rounded-full bg-orange-400/70 shadow-[0_0_10px_#ea580c]" />
        <span className="absolute top-[78%] left-[60%] w-1 h-1 rounded-full bg-amber-400/60 shadow-[0_0_6px_#fbbf24]" />
      </div>
    </div>
  )
}
