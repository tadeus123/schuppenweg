import { NextRequest, NextResponse } from 'next/server'
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
  try {
    const formData = await request.formData()
    
    // Extract data
    const paymentIntentId = formData.get('paymentIntentId') as string
    const email = formData.get('email') as string
    const customerName = formData.get('customer_name') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const postalCode = formData.get('postal_code') as string

    if (!paymentIntentId || !email || !customerName || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find existing order (created by webhook)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    let order: any

    if (existingOrder) {
      // Use existing order (created by webhook)
      console.log('Using existing order:', existingOrder.id)
      order = existingOrder
    } else {
      // Create order if it doesn't exist (fallback)
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          email,
          customer_name: customerName,
          address,
          city,
          postal_code: postalCode,
          payment_intent_id: paymentIntentId,
          payment_status: 'paid',
          status: 'paid',
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 }
        )
      }
      order = newOrder
    }

    // Check if images already uploaded
    const { data: existingImages } = await supabase
      .from('order_images')
      .select('position')
      .eq('order_id', order.id)

    const existingPositions = new Set(existingImages?.map(img => img.position) || [])

    // Upload images to storage and create records
    const imagePositions = ['front', 'back', 'left', 'right', 'top']
    const uploadedImages: any[] = []

    for (const position of imagePositions) {
      // Skip if already uploaded
      if (existingPositions.has(position)) {
        console.log(`Image ${position} already exists, skipping`)
        continue
      }


      const imageFile = formData.get(`image_${position}`) as File
      if (imageFile) {
        try {
          // Generate unique filename
          const fileExt = imageFile.name.split('.').pop()
          const fileName = `${order.id}/${position}.${fileExt}`

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('head-images')
            .upload(fileName, imageFile, {
              contentType: imageFile.type,
              upsert: false,
            })

          if (uploadError) {
            console.error(`Error uploading ${position} image:`, uploadError)
            continue
          }

          // Get public URL (even though bucket is private, we'll use signed URLs later)
          const { data: { publicUrl } } = supabase.storage
            .from('head-images')
            .getPublicUrl(fileName)

          // Create order_image record
          const { data: imageRecord, error: imageError } = await supabase
            .from('order_images')
            .insert({
              order_id: order.id,
              image_url: publicUrl,
              position,
            })
            .select()
            .single()

          if (imageError) {
            console.error(`Error creating image record for ${position}:`, imageError)
          } else {
            uploadedImages.push(imageRecord)
          }
        } catch (error) {
          console.error(`Error processing ${position} image:`, error)
        }
      }
    }

    return NextResponse.json({
      orderId: order.id,
      uploadedImages: uploadedImages.length,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Complete order error:', error)
    return NextResponse.json(
      { error: 'Failed to complete order' },
      { status: 500 }
    )
  }
}
