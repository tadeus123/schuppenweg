'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useOrder } from '@/lib/context/order-context'
import { StripeProvider } from '@/components/stripe/stripe-provider'
import { PaymentForm } from '@/components/stripe/payment-form'
import type { ShippingDetails } from '@/lib/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { images, setShippingDetails } = useOrder()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false)
  const [formData, setFormData] = useState<ShippingDetails>({
    email: '',
    customer_name: '',
    address: '',
    city: '',
    postal_code: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const hasImages = Object.values(images).every(Boolean)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Gültige E-Mail erforderlich'
    }
    if (!formData.customer_name) newErrors.customer_name = 'Name erforderlich'
    if (!formData.address) newErrors.address = 'Adresse erforderlich'
    if (!formData.city) newErrors.city = 'Stadt erforderlich'
    if (!formData.postal_code || !/^\d{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = '5-stellige PLZ erforderlich'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const createPaymentIntent = useCallback(async () => {
    setIsCreatingPaymentIntent(true)
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shippingDetails: formData,
          amount: 3000, // 30.00 EUR
        }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        setIsCreatingPaymentIntent(false)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Zahlung')
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setShippingDetails(formData)
      }
    } catch (error) {
      console.error('Payment Intent error:', error)
      setErrors({
        form: error instanceof Error ? error.message : 'Fehler. Bitte erneut versuchen.',
      })
    } finally {
      setIsCreatingPaymentIntent(false)
    }
  }, [formData])

  // Create payment intent when form is complete
  useEffect(() => {
    const isFormValid = 
      formData.email && 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.customer_name &&
      formData.address &&
      formData.city &&
      formData.postal_code &&
      /^\d{5}$/.test(formData.postal_code)

    if (isFormValid && !clientSecret) {
      createPaymentIntent()
    }
  }, [formData, clientSecret, createPaymentIntent])

  const handlePaymentSuccess = (paymentIntentId: string) => {
    router.push(`/success?payment_intent=${paymentIntentId}`)
  }

  const handlePaymentError = (error: string) => {
    setErrors({ form: error })
  }

  if (!hasImages && mounted) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center w-full max-w-md">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-8 sm:mb-10">Erst Fotos.</h1>
            <Link href="/upload" className="inline-block" style={{ textDecoration: 'none' }}>
              <Button variant="primary" className="px-10 py-4 text-lg whitespace-nowrap">
                Fotos hochladen
              </Button>
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Left side - dark background */}
        <div className="hidden lg:flex lg:w-1/2 relative z-0" />
        
        {/* Right side - dark stripe */}
        <div className="w-full lg:w-1/2 bg-background-secondary relative z-10 overflow-y-auto">
          <div className="w-full py-12 sm:py-16 md:py-24">
            <div style={{ paddingLeft: '24px', paddingRight: '24px', maxWidth: '600px', margin: '0 auto' }}>
              {/* Combined Dark Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
            {/* Header with Brand */}
            <div className="pt-6 pb-8 sm:pt-8 sm:pb-12 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-5">
                <div className="flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Schuppenweg 30-Tage Kit</h1>
                  <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">Personalisiertes Behandlungskit mit Dermatologen-Analyse</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xl sm:text-2xl font-bold text-foreground block">30,00 €</span>
                  <span className="text-xs text-foreground-muted">inkl. MwSt.</span>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="h-8 sm:h-12" />

            {/* Shipping Form */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-foreground-muted uppercase tracking-wide mb-6 sm:mb-8">Versanddaten</h3>
              <div className="space-y-6 sm:space-y-8">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="E-Mail"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />

                <Input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  placeholder="Name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  error={errors.customer_name}
                  autoComplete="name"
                />

                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Adresse"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  autoComplete="street-address"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
                  <Input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    placeholder="PLZ"
                    value={formData.postal_code}
                    onChange={handleChange}
                    error={errors.postal_code}
                    autoComplete="postal-code"
                    maxLength={5}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Stadt"
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                      autoComplete="address-level2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="h-8 sm:h-12" />

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Spacer */}
            <div className="h-8 sm:h-12" />

            {/* Payment Form */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-foreground-muted uppercase tracking-wide mb-6 sm:mb-8">Zahlung</h3>
              
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 sm:mb-8 text-error text-sm bg-error/10 border border-error/20 rounded-lg py-3 px-4"
                >
                  {errors.form}
                </motion.div>
              )}

              {clientSecret ? (
                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </StripeProvider>
              ) : isCreatingPaymentIntent ? (
                <div className="text-center py-16 sm:py-24">
                  <div className="animate-spin h-5 w-5 border-2 border-border border-t-foreground rounded-full mx-auto mb-3" />
                  <p className="text-foreground-muted text-sm">Wird geladen...</p>
                </div>
              ) : (
                <div className="text-center py-16 sm:py-24">
                  <p className="text-foreground-subtle text-sm">Bitte zuerst Versanddaten ausfüllen</p>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="h-8 sm:h-12" />

            {/* Footer inside box */}
            <div className="pb-6 sm:pb-8">
              <div className="flex items-center justify-center gap-2 text-xs text-foreground-subtle">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Sichere Zahlung via Stripe</span>
              </div>
            </div>
            </motion.div>

            {/* Footer outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border"
            >
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-foreground-muted">
                  <Link href="/terms" className="hover:text-foreground transition-colors font-medium">
                    AGB
                  </Link>
                  <span className="text-border hidden sm:inline">·</span>
                  <Link href="/privacy" className="hover:text-foreground transition-colors font-medium">
                    Datenschutz
                  </Link>
                  <span className="text-border hidden sm:inline">·</span>
                  <Link href="/imprint" className="hover:text-foreground transition-colors font-medium">
                    Impressum
                  </Link>
                </div>
                <p className="text-xs text-foreground-subtle text-center px-4">
                  © {new Date().getFullYear()} Schuppenweg. Alle Rechte vorbehalten.
                </p>
              </div>
            </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
