'use client'

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ReactNode } from 'react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

interface StripeProviderProps {
  children: ReactNode
  clientSecret: string
  options?: StripeElementsOptions
}

export function StripeProvider({ children, clientSecret, options }: StripeProviderProps) {
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#14b8a6',
        colorBackground: '#0a0a0a',
        colorText: '#fafafa',
        colorDanger: '#ef4444',
        colorSuccess: '#22c55e',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
        fontSizeBase: '16px', // Larger base font for mobile to prevent zoom
      },
      rules: {
        '.Input': {
          border: '1px solid #27272a',
          backgroundColor: '#0a0a0a',
          boxShadow: 'none',
          padding: '14px 12px', // More vertical padding for mobile
          fontSize: '16px', // Prevent zoom on iOS
          minHeight: '48px', // Better touch target
          color: '#fafafa',
        },
        '.Input:focus': {
          border: '1px solid #14b8a6',
          boxShadow: 'none',
        },
        '.Input--invalid': {
          border: '1px solid #ef4444',
        },
        '.Label': {
          color: '#a1a1aa',
          fontWeight: '500',
          fontSize: '14px',
          marginBottom: '8px',
        },
        '.Tab': {
          border: '1px solid #27272a',
          borderRadius: '6px',
          backgroundColor: '#0a0a0a',
        },
        '.Tab--selected': {
          borderColor: '#14b8a6',
          backgroundColor: '#111111',
        },
        '.TabLabel': {
          color: '#a1a1aa',
        },
        '.TabLabel--selected': {
          color: '#fafafa',
        },
      },
    },
    ...options,
  }

  return (
    <Elements options={elementsOptions} stripe={stripePromise}>
      {children}
    </Elements>
  )
}
