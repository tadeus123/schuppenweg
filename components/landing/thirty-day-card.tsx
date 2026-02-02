'use client'

import { motion } from 'framer-motion'
import { Section } from '@/components/ui/section'

const phases = [
  { days: '1-7', name: 'Reset', desc: 'Intensive Reinigung', color: 'bg-accent' },
  { days: '8-21', name: 'Aufbau', desc: 'Kopfhaut regenerieren', color: 'bg-accent/70' },
  { days: '22-30', name: 'Fertig', desc: 'Ergebnis sichern', color: 'bg-success' },
]

export function ThirtyDayCard() {
  return (
    <Section className="bg-background-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm uppercase tracking-widest mb-4">Der Plan</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">
            30 Tage zum Ziel
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          className="mb-12 origin-left"
        >
          <div className="flex h-2 rounded-full overflow-hidden">
            {phases.map((phase) => (
              <div key={phase.days} className={`flex-1 ${phase.color}`} />
            ))}
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.days}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-background text-center"
            >
              <div className={`w-14 h-14 mx-auto mb-6 rounded-full ${phase.color} flex items-center justify-center text-white font-bold text-lg`}>
                {phase.days.split('-')[0]}
              </div>
              <p className="font-heading text-xl font-semibold mb-2">Tag {phase.days}</p>
              <p className="text-accent text-sm font-medium mb-3">{phase.name}</p>
              <p className="text-foreground-muted text-sm">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
