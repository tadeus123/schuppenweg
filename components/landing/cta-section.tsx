'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Section } from '@/components/ui/section'

export function CTASection() {
  return (
    <Section className="bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Bereit für schuppenfreie Tage?
          </h2>
          <p className="text-foreground-muted text-lg mb-12">
            30 Euro. 30 Tage. Fertig.
          </p>
          
          <Link href="/how-it-works" className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-accent text-white font-medium text-lg rounded-full transition-colors hover:bg-accent-hover"
            >
              Jetzt starten
            </motion.button>
          </Link>
          <Link href="/upload" className="hidden md:inline-block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-accent text-white font-medium text-lg rounded-full transition-colors hover:bg-accent-hover"
            >
              Jetzt starten
            </motion.button>
          </Link>
          
          <p className="text-foreground-muted text-sm mt-10">
            Sichere Zahlung · 3-5 Tage Lieferung
          </p>
        </motion.div>
      </div>
    </Section>
  )
}
