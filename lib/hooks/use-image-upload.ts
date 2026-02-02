'use client'

import { useState, useCallback, useEffect } from 'react'
import imageCompression from 'browser-image-compression'
import type { ImagePosition, UploadedImage } from '@/lib/types'

// More aggressive compression for mobile devices
const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

const compressionOptions = {
  maxSizeMB: isMobile ? 0.5 : 1, // Smaller for mobile
  maxWidthOrHeight: isMobile ? 1280 : 1920,
  useWebWorker: true,
}

// Generate or retrieve session temp ID
function getTempId(): string {
  if (typeof window === 'undefined') return ''
  
  let tempId = sessionStorage.getItem('order_temp_id')
  if (!tempId) {
    tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('order_temp_id', tempId)
  }
  return tempId
}

export function useImageUpload() {
  const [images, setImages] = useState<Record<ImagePosition, UploadedImage | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
  })
  const [isCompressing, setIsCompressing] = useState(false)
  const [tempId] = useState(getTempId)

  const handleImageSelect = useCallback(async (position: ImagePosition, file: File) => {
    setIsCompressing(true)
    
    try {
      // Compress the image
      const compressedFile = await imageCompression(file, compressionOptions)
      
      // Create preview URL
      const preview = URL.createObjectURL(compressedFile)
      
      // Upload to temp storage immediately
      const formData = new FormData()
      formData.append('image', compressedFile)
      formData.append('position', position)
      formData.append('tempId', tempId)
      
      const response = await fetch('/api/upload-temp-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      
      const { imageUrl } = await response.json()
      
      // Store with uploaded URL
      setImages((prev) => ({
        ...prev,
        [position]: {
          position,
          file: compressedFile, // Keep for preview
          preview,
          uploadedUrl: imageUrl, // Server URL
        } as any,
      }))
    } catch (error) {
      console.error('Error compressing/uploading image:', error)
      // Fallback: store locally without upload
      const preview = URL.createObjectURL(file)
      setImages((prev) => ({
        ...prev,
        [position]: {
          position,
          file,
          preview,
        },
      }))
    } finally {
      setIsCompressing(false)
    }
  }, [tempId])

  const handleImageRemove = useCallback((position: ImagePosition) => {
    setImages((prev) => {
      const current = prev[position]
      if (current?.preview) {
        URL.revokeObjectURL(current.preview)
      }
      return {
        ...prev,
        [position]: null,
      }
    })
  }, [])

  const clearAllImages = useCallback(() => {
    Object.values(images).forEach((img) => {
      if (img?.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setImages({
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
    })
  }, [images])

  const allImagesUploaded = Object.values(images).every(Boolean)
  const uploadedCount = Object.values(images).filter(Boolean).length

  return {
    images,
    isCompressing,
    handleImageSelect,
    handleImageRemove,
    clearAllImages,
    allImagesUploaded,
    uploadedCount,
  }
}
