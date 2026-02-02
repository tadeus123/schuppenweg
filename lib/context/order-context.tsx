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

// Helper to serialize File objects to base64 for storage
async function serializeImages(images: Record<ImagePosition, UploadedImage | null>): Promise<string> {
  const serialized: Record<string, any> = {}
  
  for (const [position, image] of Object.entries(images)) {
    if (image?.file) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(image.file)
      })
      
      serialized[position] = {
        preview: image.preview,
        fileData: base64,
        fileName: image.file.name,
        fileType: image.file.type,
      }
    }
  }
  
  return JSON.stringify(serialized)
}

// Helper to deserialize base64 back to File objects
async function deserializeImages(data: string): Promise<Record<ImagePosition, UploadedImage | null>> {
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
      if (data && typeof data === 'object' && 'fileData' in data) {
        // Convert base64 back to Blob
        const response = await fetch(data.fileData)
        const blob = await response.blob()
        const file = new File([blob], data.fileName, { type: data.fileType })
        
        images[position as ImagePosition] = {
          file,
          preview: data.preview,
        }
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
    const restoreData = async () => {
      try {
        const savedImages = sessionStorage.getItem('order_images')
        const savedShipping = sessionStorage.getItem('order_shipping')
        const savedSessionId = sessionStorage.getItem('order_session_id')
        
        if (savedImages) {
          const restoredImages = await deserializeImages(savedImages)
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
    }
    
    restoreData()
  }, [])

  const setImages = useCallback((newImages: Record<ImagePosition, UploadedImage | null>) => {
    setImagesState(newImages)
    // Persist to sessionStorage
    serializeImages(newImages).then(serialized => {
      sessionStorage.setItem('order_images', serialized)
    })
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
