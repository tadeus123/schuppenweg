'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const steps = [
  '5 Fotos',
  'Dermatologen-Analyse',
  'Paket zu dir',
  '30 Tage',
  'Schuppen weg',
]

function Arrow() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-foreground-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

export default function HowItWorksPage() {
  const router = useRouter()

  // Redirect to upload on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        router.push('/upload')
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [router])

  return (
    <main className="min-h-screen flex flex-col px-6 md:hidden">
      <div className="w-full text-center flex-1 flex flex-col justify-between py-12">
        {/* WIE ES FUNKTIONIERT - Ganz oben */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-4"
        >
          <p className="font-heading text-accent text-sm uppercase tracking-[0.3em] font-semibold">
            Wie es funktioniert
          </p>
        </motion.div>
        
        {/* Steps flow - Kompakt in der Mitte */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center items-center gap-2.5 px-2"
        >
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2.5">
              <span
                className={`
                  font-heading text-lg sm:text-xl font-bold tracking-tight
                  ${i === steps.length - 1 ? 'text-accent' : 'text-foreground'}
                `}
              >
                {label}
              </span>
              {i < steps.length - 1 && <Arrow />}
            </div>
          ))}
        </motion.div>

        {/* Verstanden? Button - Ganz unten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pb-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/upload')}
            className="px-12 py-5 text-xl whitespace-nowrap w-full max-w-sm mx-auto"
          >
            Verstanden?
          </Button>
        </motion.div>
      </div>
    </main>
  )
}
