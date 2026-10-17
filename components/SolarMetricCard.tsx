'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import BorderBeam from './BorderBeam'
import { TrendingUp, ArrowUpRight, LucideIcon } from 'lucide-react'

export interface SolarMetricCardProps {
  title: string
  value: string | number
  unit?: string
  incrementPct?: number
  comparisonText?: string
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  withBorderBeam?: boolean
  className?: string
  statusTag?: string
  sparkline?: React.ReactNode
}

/**
 * Maps the increment percentage to proportional solar orange color intensities.
 * Strictly adheres to the design specification: orange/amber tones scaled dynamically to % increment.
 */
function getSolarOrangeClasses(pct?: number) {
  if (pct === undefined || pct === null) {
    return {
      border: 'border-zinc-800/80',
      bg: 'bg-zinc-950/80',
      textAccent: 'text-zinc-200',
      badge: 'bg-zinc-900 text-zinc-400 border-zinc-800',
      glow: '',
      iconColor: 'text-zinc-400',
    }
  }

  if (pct <= 0) {
    return {
      border: 'border-zinc-800/80',
      bg: 'bg-zinc-950/80',
      textAccent: 'text-zinc-300',
      badge: 'bg-zinc-900 text-zinc-400 border-zinc-800',
      glow: '',
      iconColor: 'text-zinc-500',
    }
  }

  if (pct <= 10) {
    return {
      border: 'border-amber-500/30 hover:border-amber-500/50',
      bg: 'bg-gradient-to-b from-amber-950/20 via-zinc-950/90 to-zinc-950',
      textAccent: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]',
      iconColor: 'text-amber-400',
    }
  }

  if (pct <= 20) {
    return {
      border: 'border-orange-500/40 hover:border-orange-500/60',
      bg: 'bg-gradient-to-b from-orange-950/30 via-zinc-950/90 to-zinc-950',
      textAccent: 'text-orange-400',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/40 font-semibold',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.12)]',
      iconColor: 'text-orange-400',
    }
  }

  // High tier (> 20% gain, e.g. +24.8% Mechatronic Advantage)
  return {
    border: 'border-orange-500/60 hover:border-orange-400',
    bg: 'bg-gradient-to-b from-orange-950/45 via-amber-950/25 to-zinc-950',
    textAccent: 'text-orange-300',
    badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black border border-amber-300 shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.20)]',
    iconColor: 'text-orange-300',
  }
}

export default function SolarMetricCard({
  title,
  value,
  unit,
  incrementPct,
  comparisonText,
  icon: Icon,
  withBorderBeam = false,
  className,
  statusTag,
  sparkline,
}: SolarMetricCardProps) {
  const theme = getSolarOrangeClasses(incrementPct)

  return (
    <div
      className={cn(
        'relative rounded-2xl p-5 border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden',
        theme.bg,
        theme.border,
        theme.glow,
        className
      )}
    >
      {/* Magic UI Border Beam on elevated cards */}
      {withBorderBeam && (
        <BorderBeam
          duration={8}
          colorFrom="#f97316"
          colorTo="#fbbf24"
          borderWidth={1.5}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {statusTag && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
              {statusTag}
            </span>
          )}
          {Icon && (
            <div className={cn('p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80', theme.iconColor)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-2 flex items-baseline gap-1.5">
        <span className={cn('text-3xl font-black font-mono tracking-tight text-white')}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-mono text-zinc-400 font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Sparkline if provided */}
      {sparkline && <div className="my-1">{sparkline}</div>}

      {/* Footer / Delta comparison */}
      <div className="pt-2 border-t border-zinc-900/90 flex items-center justify-between gap-2 text-xs">
        {incrementPct !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono',
                theme.badge
              )}
            >
              {incrementPct > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              ) : null}
              {incrementPct > 0 ? `+${incrementPct}%` : `${incrementPct}%`}
            </span>
            {comparisonText && (
              <span className="text-[11px] text-zinc-400 truncate">
                {comparisonText}
              </span>
            )}
          </div>
        ) : comparisonText ? (
          <span className="text-[11px] text-zinc-400">
            {comparisonText}
          </span>
        ) : null}
      </div>
    </div>
  )
}
