'use client'

import { motion } from 'framer-motion'
import { Section } from '@/components/ui/section'

const steps = [
  '5 Fotos',
  'Dermatologen-Analyse',
  'Paket zu dir',
  '30 Tage',
  'Schuppen weg',
]

function Arrow() {
  return (
    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0 text-foreground-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

export function SolutionSection() {
  return (
    <Section className="bg-background py-20 md:py-28" fullWidth>
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Headline - hidden on mobile, shown on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="hidden md:block text-center mb-8 md:mb-12"
        >
          <p className="font-heading text-accent text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold" style={{ height: '20px' }}>
            Wie es funktioniert
          </p>
        </motion.div>

        {/* Steps flow - single line, wraps naturally - hidden on mobile, shown on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6"
          style={{ height: '35px', lineHeight: '51px' }}
        >
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <span
                className={`
                  font-heading text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold tracking-tight
                  ${i === steps.length - 1 ? 'text-accent' : 'text-foreground'}
                `}
              >
                {label}
              </span>
              {i < steps.length - 1 && <Arrow />}
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
