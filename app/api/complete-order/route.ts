import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { moveTempImagesToOrder } from '@/lib/utils/move-temp-images'

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
  console.log('🔵 ===== COMPLETE ORDER API CALLED =====')
  try {
    const formData = await request.formData()
    
    // Log all form data keys for debugging
    const formDataKeys = Array.from(formData.keys())
    console.log('📋 FormData keys:', formDataKeys)
    console.log('📋 FormData entries:', Array.from(formData.entries()).map(([k, v]) => 
      `${k}: ${v instanceof File ? `File(${v.name})` : String(v).substring(0, 50)}`
    ))
    
    // Extract data
    const paymentIntentId = formData.get('paymentIntentId') as string
    const email = formData.get('email') as string
    const customerName = formData.get('customer_name') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const postalCode = formData.get('postal_code') as string

    console.log('📦 Payment Intent ID:', paymentIntentId)
    console.log('📧 Email:', email)
    console.log('🖼️  Image fields:', formDataKeys.filter(k => k.startsWith('image_')))

    if (!paymentIntentId) {
      console.error('❌ Missing paymentIntentId')
      return NextResponse.json(
        { error: 'Missing paymentIntentId', received: formDataKeys },
        { status: 400 }
      )
    }
    
    // Shipping details are optional if order already exists (created by webhook)
    console.log('📋 Has shipping details:', !!email && !!customerName)

    // Find existing order (created by webhook)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    let order: any

    if (existingOrder) {
      // Use existing order (created by webhook)
      console.log('✅ Using existing order:', existingOrder.id)
      order = existingOrder
    } else {
      // Create order if it doesn't exist (fallback - need shipping details)
      if (!email || !customerName || !address || !city || !postalCode) {
        console.error('❌ Order not found and shipping details missing for creation')
        return NextResponse.json(
          { error: 'Order not found and cannot create without shipping details' },
          { status: 400 }
        )
      }
      
      console.log('⚠️  Creating new order (webhook might have failed)')
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
        console.error('❌ Error creating order:', orderError)
        return NextResponse.json(
          { error: 'Failed to create order', details: orderError.message },
          { status: 500 }
        )
      }
      order = newOrder
      console.log('✅ Created new order:', order.id)
    }

    // First, try to move any temp images automatically (mobile flow)
    console.log('🔄 Checking for temp images to move...')
    const movedCount = await moveTempImagesToOrder(order.id)
    if (movedCount > 0) {
      console.log(`✅ Moved ${movedCount} images from temp storage`)
    }

    // Check if images already uploaded
    const { data: existingImages } = await supabase
      .from('order_images')
      .select('position')
      .eq('order_id', order.id)

    const existingPositions = new Set(existingImages?.map(img => img.position) || [])
    
    // If we have all 5 images, we're done
    if (existingPositions.size >= 5) {
      console.log('✅ All 5 images already uploaded')
      return NextResponse.json({
        orderId: order.id,
        uploadedImages: 5,
        message: 'Order completed successfully'
      })
    }

    // Upload images to storage and create records
    const imagePositions = ['front', 'back', 'left', 'right', 'top']
    const uploadedImages: any[] = []

    // Get temp ID if images were pre-uploaded (mobile flow)
    const tempId = formData.get('tempId') as string

    for (const position of imagePositions) {
      // Skip if already uploaded
      if (existingPositions.has(position)) {
        console.log(`Image ${position} already exists, skipping`)
        continue
      }

      // Check for pre-uploaded image URL (mobile flow)
      const preUploadedUrl = formData.get(`image_${position}_url`) as string
      
      if (preUploadedUrl && tempId) {
        // Mobile: Image already in temp storage, move to final location
        try {
          const tempPath = `temp/${tempId}/${position}.jpg`
          const finalPath = `${order.id}/${position}.jpg`
          
          // Download from temp
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('head-images')
            .download(tempPath)
          
          if (downloadError) {
            console.error(`Error downloading temp ${position}:`, downloadError)
            continue
          }
          
          // Upload to final location
          const { error: uploadError } = await supabase.storage
            .from('head-images')
            .upload(finalPath, fileData, {
              contentType: 'image/jpeg',
              upsert: false,
            })
          
          if (uploadError) {
            console.error(`Error moving ${position}:`, uploadError)
            continue
          }
          
          // Delete temp file
          await supabase.storage.from('head-images').remove([tempPath])
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('head-images')
            .getPublicUrl(finalPath)
          
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
          
          if (!imageError) {
            uploadedImages.push(imageRecord)
            console.log(`✅ Moved temp ${position} to final`)
          }
        } catch (error) {
          console.error(`Error moving temp ${position}:`, error)
        }
      } else {
        // Desktop: Direct upload from FormData
        const imageFile = formData.get(`image_${position}`) as File
        if (imageFile) {
          try {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${order.id}/${position}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('head-images')
              .upload(fileName, imageFile, {
                contentType: imageFile.type,
                upsert: false,
              })

            if (uploadError) {
              console.error(`Error uploading ${position}:`, uploadError)
              continue
            }

            const { data: { publicUrl } } = supabase.storage
              .from('head-images')
              .getPublicUrl(fileName)

            const { data: imageRecord, error: imageError } = await supabase
              .from('order_images')
              .insert({
                order_id: order.id,
                image_url: publicUrl,
                position,
              })
              .select()
              .single()

            if (!imageError) {
              uploadedImages.push(imageRecord)
            }
          } catch (error) {
            console.error(`Error processing ${position}:`, error)
          }
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
