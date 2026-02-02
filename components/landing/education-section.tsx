'use client'

import { motion } from 'framer-motion'
import { Section } from '@/components/ui/section'

export function EducationSection() {
  return (
    <Section className="bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm uppercase tracking-widest mb-4">Zwei Typen</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Trocken oder fettig?
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto">
            Das falsche Produkt macht es schlimmer. Wir finden raus, was du brauchst.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-background-secondary"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                <span className="text-foreground font-bold text-lg">T</span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Trocken</h3>
                <p className="text-foreground-muted text-sm">Typ A</p>
              </div>
            </div>
            <ul className="space-y-3 text-foreground-muted">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted shrink-0 mt-1.5" />
                <span>Weiße, feine Flocken</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted shrink-0 mt-1.5" />
                <span>Fallen leicht ab</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted shrink-0 mt-1.5" />
                <span>Trockene Kopfhaut</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl bg-background-secondary"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <span className="text-warning font-bold text-lg">F</span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Fettig</h3>
                <p className="text-foreground-muted text-sm">Typ B</p>
              </div>
            </div>
            <ul className="space-y-3 text-foreground-muted">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                <span>Gelbliche, größere Flocken</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                <span>Kleben an der Kopfhaut</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                <span>Ölige Kopfhaut</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
