'use client'

import { useState, useEffect } from 'react'

interface OrderImageProps {
  imageUrl: string
  position: string
  alt: string
}

export function OrderImage({ imageUrl, position, alt }: OrderImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const response = await fetch(`/api/get-image-url?path=${encodeURIComponent(imageUrl)}`)
        if (!response.ok) {
          throw new Error('Failed to get signed URL')
        }
        const data = await response.json()
        setSignedUrl(data.signedUrl)
      } catch (err) {
        console.error('Error fetching signed URL:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignedUrl()
  }, [imageUrl])

  if (isLoading) {
    return (
      <div className="aspect-square bg-background-tertiary border border-border flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-border border-t-foreground rounded-full" />
      </div>
    )
  }

  if (error || !signedUrl) {
    return (
      <div className="aspect-square bg-background-tertiary border border-border flex items-center justify-center">
        <span className="text-xs text-error">Fehler beim Laden</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="aspect-square bg-background-tertiary border border-border overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signedUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="absolute bottom-2 left-2 px-2 py-1 bg-background/90 text-xs font-medium capitalize">
        {position}
      </span>
    </div>
  )
}
