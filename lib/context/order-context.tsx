'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
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

export function OrderProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Record<ImagePosition, UploadedImage | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
  })
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const clearOrder = useCallback(() => {
    // Clean up preview URLs
    setImages((currentImages) => {
      Object.values(currentImages).forEach((img) => {
        if (img?.preview) {
          URL.revokeObjectURL(img.preview)
        }
      })
      return {
        front: null,
        back: null,
        left: null,
        right: null,
        top: null,
      }
    })
    setShippingDetails(null)
    setSessionId(null)
  }, []) // Empty deps since we use functional updates

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
