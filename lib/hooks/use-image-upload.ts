'use client'

import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import type { ImagePosition, UploadedImage } from '@/lib/types'

const compressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
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

  const handleImageSelect = useCallback(async (position: ImagePosition, file: File) => {
    setIsCompressing(true)
    
    try {
      // Compress the image
      const compressedFile = await imageCompression(file, compressionOptions)
      
      // Create preview URL
      const preview = URL.createObjectURL(compressedFile)
      
      setImages((prev) => ({
        ...prev,
        [position]: {
          position,
          file: compressedFile,
          preview,
        },
      }))
    } catch (error) {
      console.error('Error compressing image:', error)
      // Fallback to original file if compression fails
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
  }, [])

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
