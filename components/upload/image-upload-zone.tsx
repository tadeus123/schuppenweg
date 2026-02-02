'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ImagePosition, UploadedImage } from '@/lib/types'

interface ImageUploadZoneProps {
  position: ImagePosition
  label: string
  description: string
  image: UploadedImage | null
  onImageSelect: (position: ImagePosition, file: File) => void
  onImageRemove: (position: ImagePosition) => void
}

export function ImageUploadZone({
  position,
  label,
  image,
  onImageSelect,
  onImageRemove,
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(position, file)
    }
  }, [position, onImageSelect])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(position, file)
    }
  }, [position, onImageSelect])

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        onClick={!image ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative aspect-square border transition-all duration-200 overflow-hidden cursor-pointer group rounded-sm sm:rounded-none',
          !image && 'hover:border-accent hover:bg-accent/5 active:bg-accent/10',
          isDragging && 'border-accent bg-accent/10',
          image ? 'border-transparent' : 'border-border'
        )}
      >
        <AnimatePresence mode="wait">
          {image ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={label}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div 
                onClick={(e) => {
                  e.stopPropagation()
                  onImageRemove(position)
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <svg className="w-8 h-8 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              {/* Check mark */}
              <div className="absolute top-2 right-2 w-7 h-7 sm:w-6 sm:h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3"
            >
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-foreground-subtle mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-xs text-foreground-muted font-medium">{label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
