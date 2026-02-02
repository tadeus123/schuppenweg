'use client'

import { motion } from 'framer-motion'
import { Section } from '@/components/ui/section'

export function FoundersSection() {
  return (
    <Section className="bg-background-secondary">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-accent text-sm uppercase tracking-widest mb-4">Warum wir das machen</p>
          
          <h2 className="font-heading text-2xl md:text-3xl font-bold leading-snug mb-6">
            Wir hatten das gleiche Problem – also haben wir's gelöst.
          </h2>
          
          <p className="text-foreground-muted mb-6">
            Tade & Constantin · Gründer
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm">
            <span className="w-2 h-2 rounded-full bg-success" />
            ±0 Profit
          </div>
        </motion.div>
      </div>
    </Section>
  )
}
