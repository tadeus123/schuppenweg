import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL is not set')
      return NextResponse.json(
        { error: 'App URL is not configured. Please set NEXT_PUBLIC_APP_URL environment variable.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { shippingDetails } = body

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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Schuppenweg 30-Tage Kit',
              description: 'Personalisiertes Behandlungskit mit Dermatologen-Analyse',
              images: process.env.NEXT_PUBLIC_APP_URL 
                ? [`${process.env.NEXT_PUBLIC_APP_URL}/images/kit-preview.png`]
                : [],
            },
            unit_amount: 3000, // 30.00 EUR in cents
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['DE'],
      },
      metadata: {
        customer_name,
        address,
        city,
        postal_code,
        email,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Checkout session error:', error)
    
    // Return detailed error message for debugging
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create checkout session'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
