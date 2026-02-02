'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { HERO_VIDEO } from '@/lib/hero-video'
import { cn } from '@/lib/utils'

const HEADLINE = '30 Tage, 30 Euro, Schuppen Weg, Mann.'
const CHARS = HEADLINE.split('')

// Lines for vertical stacking - each line appears separately
const LINES = ['30 Tage,', '30 Euro,', 'Schuppen Weg,', 'Mann.']

// Smooth, consistent typing speed
const BASE_TYPING_DELAY = 0.08
const PAUSE_AFTER_COMMA = 0.15
const PAUSE_AFTER_PERIOD = 0.2

// Calculate delay for each character with minimal pauses
const getCharDelay = (index: number, char: string, prevChar: string) => {
  let delay = BASE_TYPING_DELAY
  
  // Small pause after punctuation for natural typing rhythm
  if (prevChar === ',') delay += PAUSE_AFTER_COMMA
  if (prevChar === '.') delay += PAUSE_AFTER_PERIOD
  
  return delay
}

export function Hero() {
  // Pre-calculate delays for consistent animation (memoized for performance)
  const cumulativeDelays = useMemo(() => {
    const charDelays = CHARS.map((char, index) => {
      const prevChar = index > 0 ? CHARS[index - 1] : ''
      return getCharDelay(index, char, prevChar)
    })
    
    // Calculate cumulative delays
    return charDelays.reduce((acc, delay, index) => {
      acc[index] = index === 0 ? delay : acc[index - 1] + delay
      return acc
    }, [] as number[])
  }, [])

  // Calculate when "Mann." finishes - button should appear then
  const buttonDelay = useMemo(() => {
    const mannStartIdx = HEADLINE.indexOf('Mann.')
    const mannEndIdx = mannStartIdx + 'Mann.'.length - 1 // Index of the period
    // Button appears when the period finishes appearing, plus a small buffer
    return cumulativeDelays[mannEndIdx] + BASE_TYPING_DELAY + 0.1
  }, [cumulativeDelays])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-40">
      {/* Top left title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-6 left-6 z-20"
      >
        <span className="font-heading text-sm uppercase tracking-[0.25em] text-foreground-muted">
          tech that dominates
        </span>
      </motion.div>

      {/* Video möglichst früh laden und starten */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,1) 100%)' }}
          aria-hidden
        />
      </div>

      <div className="container relative z-20 px-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-5xl w-full flex flex-col items-center text-center"
        >
          {/* Typewriter: Natural typing animation - stacked vertically */}
          <div className="flex flex-col items-center gap-y-2">
            {LINES.map((line, lineIdx) => {
              // Find the position of this line in the original HEADLINE
              // HEADLINE: '30 Tage, 30 Euro, Schuppen Weg, Mann.'
              let lineStartIdx = 0
              if (lineIdx === 0) lineStartIdx = 0 // "30 Tage,"
              else if (lineIdx === 1) lineStartIdx = HEADLINE.indexOf('30 Euro,') // "30 Euro,"
              else if (lineIdx === 2) lineStartIdx = HEADLINE.indexOf('Schuppen Weg,') // "Schuppen Weg,"
              else if (lineIdx === 3) lineStartIdx = HEADLINE.indexOf('Mann.') // "Mann."
              
              const isFirstPart = lineIdx <= 1 // "30 Tage," and "30 Euro,"
              
              return (
                <h1
                  key={lineIdx}
                  className={cn(
                    'font-hero text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-[#e4e4e7]',
                    'flex justify-center items-baseline',
                    '[text-shadow:0_2px_40px_rgba(0,0,0,0.4)]'
                  )}
                  style={{ lineHeight: '110px' }}
                >
                  {line.split('').map((char, i) => {
                    const idx = lineStartIdx + i
                    // Skip if we're beyond the HEADLINE length (shouldn't happen, but safety check)
                    if (idx >= CHARS.length) return null
                    
                    const isSpace = char === ' '
                    const charDelay = cumulativeDelays[idx]
                    const nextCharDelay = idx < CHARS.length - 1 ? cumulativeDelays[idx + 1] : charDelay + BASE_TYPING_DELAY
                    const cursorDuration = nextCharDelay - charDelay
                    // Only show cursor if not at end of line and not at end of entire headline
                    const showCursor = idx < CHARS.length - 1 && cursorDuration > 0.05 && (lineIdx < LINES.length - 1 || i < line.length - 1)
                    
                    return (
                      <span key={idx} className="inline-block" style={{ verticalAlign: 'baseline' }}>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.03,
                            delay: charDelay,
                            ease: 'easeOut'
                          }}
                          style={{
                            color: isFirstPart ? '#909094' : '#e4e4e7',
                            display: 'inline-block',
                            ...(isSpace && { minWidth: '0.35em' }),
                          }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                        {showCursor && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                              times: [0, 0.5, 1],
                              duration: Math.max(cursorDuration, 0.1),
                              delay: charDelay,
                              ease: 'easeInOut',
                              repeat: 0
                            }}
                            className="inline-block text-[#e4e4e7]"
                            style={{ 
                              display: 'inline-block',
                              marginLeft: '0',
                              width: '0',
                              overflow: 'visible',
                              verticalAlign: 'baseline',
                            }}
                            aria-hidden
                          >
                            |
                          </motion.span>
                        )}
                      </span>
                    )
                  })}
                </h1>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: buttonDelay }}
            className="mt-[200px] w-full flex justify-center items-center h-[154px] pt-0 pb-0"
          >
            <Link href="/how-it-works" className="group md:hidden">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="inline-flex items-center justify-center gap-3 px-24 py-5 bg-transparent border-2 border-accent text-accent font-semibold text-base tracking-[-0.5px] uppercase whitespace-nowrap transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] group-hover:bg-accent group-hover:text-white group-hover:border-accent group-hover:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.35)]"
                style={{ width: '150px' }}
              >
                Jetzt starten
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </Link>
            <Link href="/upload" className="group hidden md:inline-block">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="inline-flex items-center justify-center gap-3 px-24 py-5 bg-transparent border-2 border-accent text-accent font-semibold text-base tracking-[-0.5px] uppercase whitespace-nowrap transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] group-hover:bg-accent group-hover:text-white group-hover:border-accent group-hover:shadow-[0_6px_28px_-4px_rgba(0,0,0,0.35)]"
                style={{ width: '150px' }}
              >
                Jetzt starten
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}
