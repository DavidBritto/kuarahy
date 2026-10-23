'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Sparkles, ArrowDown } from 'lucide-react'

interface HeroSectionProps {
  badge: string
  title: string
  subtitle: string
  scrollCue: string
}

export default function HeroSection({ badge, title, subtitle, scrollCue }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Smooth scroll parallax transforms: the text rises and fades out as you scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -180])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.25])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-8 pb-12"
    >
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 flex flex-col items-center max-w-4xl mx-auto"
      >
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span className="tracking-wider uppercase text-[11px]">{badge}</span>
        </div>

        {/* Central Solar Radial Glow Backdrop */}
        <motion.div
          style={{
            scale: glowScale,
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(249,115,22,0.35) 0%, rgba(251,191,36,0.18) 45%, transparent 70%)',
          }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] rounded-full blur-[110px] -z-10"
          aria-hidden="true"
        />

        {/* Big Central Hero Title with distinct Capital S and Capital A */}
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tight font-sans text-white drop-shadow-[0_0_40px_rgba(249,115,22,0.35)] select-none">
          {title.endsWith('A') ? (
            <>
              {title.slice(0, -1)}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                A
              </span>
            </>
          ) : (
            title
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl font-mono leading-relaxed text-balance">
          {subtitle}
        </p>

        {/* Scroll Cue Indicator */}
        <div className="mt-12 flex flex-col items-center gap-2 text-zinc-500 text-xs font-mono tracking-widest uppercase">
          <span>{scrollCue}</span>
          <ArrowDown className="w-4 h-4 text-orange-400 animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}
