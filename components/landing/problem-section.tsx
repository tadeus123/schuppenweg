'use client'

import { motion } from 'framer-motion'
import { Section } from '@/components/ui/section'

export function ProblemSection() {
  return (
    <Section className="bg-background-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm uppercase tracking-widest mb-4">Das Problem</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            50% aller Erwachsenen haben Schuppen
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Weiße Flocken auf dem schwarzen Hemd. Unangenehm, aber nicht schlimm genug für den Arzt.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative aspect-[21/9] rounded-2xl overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80"
            alt="Mann im dunklen Hemd"
            className="w-full h-full object-cover object-top grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-secondary via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-foreground text-lg font-medium max-w-md">
              Du bist zu faul zum Arzt – und das ist okay.
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}
