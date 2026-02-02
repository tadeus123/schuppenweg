'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { useOrder } from '@/lib/context/order-context'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const sessionId = searchParams.get('session_id') // Fallback for old checkout sessions
  const { images, shippingDetails, clearOrder } = useOrder()
  const [orderNumber, setOrderNumber] = useState('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const hasProcessed = useRef(false)

  useEffect(() => {
    const id = paymentIntentId || sessionId
    if (id) {
      setOrderNumber(`SW-${id.slice(-8).toUpperCase()}`)
    }

    // Upload images if we have them and haven't processed yet
    if (id && images && shippingDetails && !hasProcessed.current) {
      hasProcessed.current = true
      uploadImagesAndCompleteOrder(id)
    }
  }, [paymentIntentId, sessionId, images, shippingDetails])

  const uploadImagesAndCompleteOrder = async (paymentId: string) => {
    setUploadStatus('uploading')

    try {
      const formData = new FormData()
      formData.append('paymentIntentId', paymentId)
      
      if (shippingDetails) {
        formData.append('email', shippingDetails.email)
        formData.append('customer_name', shippingDetails.customer_name)
        formData.append('address', shippingDetails.address)
        formData.append('city', shippingDetails.city)
        formData.append('postal_code', shippingDetails.postal_code)
      }

      // Add all images
      const positions: Array<'front' | 'back' | 'left' | 'right' | 'top'> = ['front', 'back', 'left', 'right', 'top']
      for (const position of positions) {
        const image = images[position]
        if (image?.file) {
          formData.append(`image_${position}`, image.file, `${position}.jpg`)
        }
      }

      const response = await fetch('/api/complete-order', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload images')
      }

      const result = await response.json()
      console.log('Order completed:', result)
      setUploadStatus('success')
      
      // Clear order after successful upload
      clearOrder()
    } catch (error) {
      console.error('Error uploading images:', error)
      setUploadStatus('error')
      
      // Still clear order to prevent retry loops
      clearOrder()
    }
  }

  return (
    <>
      <main className="min-h-screen flex items-center justify-center py-20">
        <div style={{ paddingLeft: '24px', paddingRight: '24px', width: '100%', maxWidth: '512px', margin: '0 auto' }}>
          <div className="w-full text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-12 bg-accent/20 rounded-full flex items-center justify-center border-2 border-accent/30"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-12 h-12 md:w-14 md:h-14 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Danke.
            </h1>
            
            <p className="text-foreground-muted text-lg md:text-xl mb-12">
              Dein Paket kommt in 3-5 Tagen.
            </p>

            {orderNumber && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-3 bg-background-secondary/50 border border-border rounded-lg px-6 py-3 mb-16"
              >
                <span className="text-sm text-foreground-muted">Bestellung:</span>
                <span className="font-mono text-lg font-semibold text-accent tracking-wider">{orderNumber}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Progress Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            {/* Progress Bar */}
            <div className="flex justify-center items-center gap-2 mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '80px' }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="h-1.5 bg-accent rounded-full"
              />
              <div className="h-1.5 w-20 bg-foreground-subtle/20 rounded-full" />
              <div className="h-1.5 w-20 bg-foreground-subtle/20 rounded-full" />
            </div>

            {/* Steps */}
            <div className="space-y-6 text-left max-w-xs mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-base text-accent font-medium">Dermatologe analysiert</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-foreground-subtle/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-foreground-muted font-semibold">2</span>
                </div>
                <span className="text-base text-foreground-muted">Wir packen dein Kit</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-foreground-subtle/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-foreground-muted font-semibold">3</span>
                </div>
                <span className="text-base text-foreground-muted">Du wirst schuppenfrei</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Link href="/">
              <Button variant="secondary" size="lg">
                Zurück zur Startseite
              </Button>
            </Link>
          </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
