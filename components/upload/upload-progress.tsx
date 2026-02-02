'use client'

import { motion } from 'framer-motion'
import type { ImagePosition, UploadedImage } from '@/lib/types'

interface UploadProgressProps {
  images: Record<ImagePosition, UploadedImage | null>
}

const positions: { key: ImagePosition; label: string }[] = [
  { key: 'front', label: 'Vorne' },
  { key: 'back', label: 'Hinten' },
  { key: 'left', label: 'Links' },
  { key: 'right', label: 'Rechts' },
  { key: 'top', label: 'Oben' },
]

export function UploadProgress({ images }: UploadProgressProps) {
  const uploadedCount = Object.values(images).filter(Boolean).length
  const totalCount = positions.length
  const progress = (uploadedCount / totalCount) * 100

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">
          Fortschritt
        </span>
        <span className="text-sm font-mono">
          <span className="text-accent">{uploadedCount}</span>
          <span className="text-foreground-subtle">/{totalCount}</span>
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-background-tertiary overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-accent"
        />
      </div>
      
      {/* Position indicators */}
      <div className="flex gap-2">
        {positions.map((pos) => (
          <div
            key={pos.key}
            className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
              images[pos.key]
                ? 'bg-success/10 text-success border border-success/30'
                : 'bg-background-tertiary text-foreground-subtle border border-transparent'
            }`}
          >
            {pos.label}
          </div>
        ))}
      </div>
    </div>
  )
}
