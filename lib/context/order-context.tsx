'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import type { ImagePosition, UploadedImage, ShippingDetails } from '@/lib/types'

interface OrderContextType {
  images: Record<ImagePosition, UploadedImage | null>
  setImages: (images: Record<ImagePosition, UploadedImage | null>) => void
  shippingDetails: ShippingDetails | null
  setShippingDetails: (details: ShippingDetails) => void
  sessionId: string | null
  setSessionId: (id: string) => void
  clearOrder: () => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Simplified storage - just store the essential data
function serializeImages(images: Record<ImagePosition, UploadedImage | null>): string {
  const serialized: Record<string, any> = {}
  
  for (const [position, image] of Object.entries(images)) {
    if (image) {
      serialized[position] = {
        preview: image.preview,
        uploadedUrl: (image as any).uploadedUrl, // URL if already uploaded to temp storage
        hasFile: !!image.file,
      }
    }
  }
  
  return JSON.stringify(serialized)
}

// Restore minimal data (without File objects)
function deserializeImages(data: string): Record<ImagePosition, UploadedImage | null> {
  try {
    const parsed = JSON.parse(data)
    const images: Record<ImagePosition, UploadedImage | null> = {
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
    }
    
    for (const [position, data] of Object.entries(parsed)) {
      if (data && typeof data === 'object') {
        images[position as ImagePosition] = {
          file: null as any, // Will be populated from uploadedUrl when needed
          preview: data.preview,
          uploadedUrl: data.uploadedUrl,
        } as any
      }
    }
    
    return images
  } catch (error) {
    console.error('Error deserializing images:', error)
    return {
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
    }
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [images, setImagesState] = useState<Record<ImagePosition, UploadedImage | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
  })
  const [shippingDetails, setShippingDetailsState] = useState<ShippingDetails | null>(null)
  const [sessionId, setSessionIdState] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const savedImages = sessionStorage.getItem('order_images')
      const savedShipping = sessionStorage.getItem('order_shipping')
      const savedSessionId = sessionStorage.getItem('order_session_id')
      const savedTempId = sessionStorage.getItem('order_temp_id')
      
      if (savedImages) {
        const restoredImages = deserializeImages(savedImages)
        setImagesState(restoredImages)
      }
      
      if (savedShipping) {
        setShippingDetailsState(JSON.parse(savedShipping))
      }
      
      if (savedSessionId) {
        setSessionIdState(savedSessionId)
      }
    } catch (error) {
      console.error('Error restoring order data:', error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const setImages = useCallback((newImages: Record<ImagePosition, UploadedImage | null>) => {
    setImagesState(newImages)
    // Persist to sessionStorage (synchronous now)
    const serialized = serializeImages(newImages)
    try {
      sessionStorage.setItem('order_images', serialized)
    } catch (error) {
      console.error('Error saving images to sessionStorage:', error)
      // If sessionStorage is full, clear old data and try again
      sessionStorage.removeItem('order_images')
      sessionStorage.setItem('order_images', serialized)
    }
  }, [])

  const setShippingDetails = useCallback((details: ShippingDetails) => {
    setShippingDetailsState(details)
    sessionStorage.setItem('order_shipping', JSON.stringify(details))
  }, [])

  const setSessionId = useCallback((id: string) => {
    setSessionIdState(id)
    sessionStorage.setItem('order_session_id', id)
  }, [])

  const clearOrder = useCallback(() => {
    // Clean up preview URLs
    Object.values(images).forEach((img) => {
      if (img?.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    
    // Clear state
    setImagesState({
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
    })
    setShippingDetailsState(null)
    setSessionIdState(null)
    
    // Clear sessionStorage
    sessionStorage.removeItem('order_images')
    sessionStorage.removeItem('order_shipping')
    sessionStorage.removeItem('order_session_id')
  }, [images])

  return (
    <OrderContext.Provider
      value={{
        images,
        setImages,
        shippingDetails,
        setShippingDetails,
        sessionId,
        setSessionId,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}
