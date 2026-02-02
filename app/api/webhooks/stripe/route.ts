import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${errorMessage}`)
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      console.log('Payment successful for payment intent:', paymentIntent.id)
      console.log('Amount:', paymentIntent.amount)
      console.log('Metadata:', paymentIntent.metadata)

      const metadata = paymentIntent.metadata || {}
      
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', paymentIntent.id)
        .single()

      if (existingOrder) {
        console.log('Order already exists for payment intent:', paymentIntent.id)
        break
      }

      // Create order in database
      const orderData = {
        email: metadata.email,
        customer_name: metadata.customer_name,
        address: metadata.address,
        city: metadata.city,
        postal_code: metadata.postal_code,
        payment_intent_id: paymentIntent.id,
        payment_status: 'paid',
        status: 'paid',
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
      } else {
        console.log('Order created successfully:', order.id)
      }

      break
    }

    case 'checkout.session.completed': {
      // Legacy support for old checkout sessions
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('Payment successful for session:', session.id)
      console.log('Customer email:', session.customer_email)
      console.log('Metadata:', session.metadata)

      const paymentIntentId = session.payment_intent as string

      // Check if order already exists
      const { data: existingSessionOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', paymentIntentId)
        .single()

      if (existingSessionOrder) {
        console.log('Order already exists for session:', session.id)
        break
      }

      const metadata = session.metadata || {}
      const orderData = {
        email: session.customer_email,
        customer_name: metadata.customer_name,
        address: metadata.address,
        city: metadata.city,
        postal_code: metadata.postal_code,
        payment_intent_id: paymentIntentId,
        payment_status: 'paid',
        status: 'paid',
      }

      const { data: sessionOrder, error: sessionError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating order from session:', sessionError)
      } else {
        console.log('Order created successfully from session:', sessionOrder.id)
      }
      break
    }
    
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Checkout session expired:', session.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      console.log('Failure reason:', paymentIntent.last_payment_error?.message)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
