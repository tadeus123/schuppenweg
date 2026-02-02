import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { shippingDetails, amount } = body

    if (!shippingDetails) {
      return NextResponse.json(
        { error: 'Shipping details are required' },
        { status: 400 }
      )
    }

    const { email, customer_name, address, city, postal_code } = shippingDetails

    // Validate required fields
    if (!email || !customer_name || !address || !city || !postal_code) {
      return NextResponse.json(
        { error: 'All shipping fields are required' },
        { status: 400 }
      )
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 3000, // 30.00 EUR in cents
      currency: 'eur',
      metadata: {
        customer_name,
        address,
        city,
        postal_code,
        email,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment Intent error:', error)
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to create payment intent'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
