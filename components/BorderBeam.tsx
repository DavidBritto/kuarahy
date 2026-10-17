'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
}

/**
 * BorderBeam component inspired by Magic UI.
 * Creates an animated radiant beam of light traveling along the perimeter of the container.
 * Uses SVG stroke-dashoffset for smooth 60fps hardware-accelerated rendering across all browsers.
 */
export default function BorderBeam({
  className,
  duration = 8,
  delay = 0,
  colorFrom = '#f97316', // Solar Orange
  colorTo = '#fbbf24',   // Amber Gold
  borderWidth = 1.5,
}: BorderBeamProps) {
  const id = React.useId()

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
      <svg
        className={cn('w-full h-full absolute inset-0', className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`beam-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} stopOpacity="1" />
            <stop offset="50%" stopColor={colorTo} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colorFrom} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx="16"
          fill="none"
          stroke={`url(#beam-grad-${id})`}
          strokeWidth={borderWidth}
          strokeDasharray="160 600"
          className="animate-border-beam"
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      </svg>
    </div>
  )
}
