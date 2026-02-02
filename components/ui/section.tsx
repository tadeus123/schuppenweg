'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  fullWidth?: boolean
  containerClassName?: string
}

export function Section({ children, className, id, fullWidth = false, containerClassName }: SectionProps) {
  return (
    <section id={id} className={cn('py-24 md:py-32', className)}>
      <div className={cn(!fullWidth && 'container', containerClassName)}>
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  centered?: boolean
}

export function SectionHeader({ eyebrow, title, description, className, centered = true }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={cn('mb-16', centered && 'text-center', className)}
    >
      {eyebrow && (
        <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-4 block">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  )
}
