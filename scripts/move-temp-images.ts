import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function moveTempImages() {
  console.log('🔍 Finding orders without images...\n')

  try {
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      return
    }

    console.log(`📦 Found ${orders?.length || 0} orders\n`)

    for (const order of orders || []) {
      // Check if order has images
      const { data: existingImages } = await supabase
        .from('order_images')
        .select('id')
        .eq('order_id', order.id)

      if (existingImages && existingImages.length > 0) {
        console.log(`✓ Order ${order.id} already has ${existingImages.length} images`)
        continue
      }

      console.log(`\n📋 Processing order ${order.id} (${order.email})`)

      // List all temp folders
      const { data: tempFolders, error: listError } = await supabase.storage
        .from('head-images')
        .list('temp', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (listError || !tempFolders) {
        console.log('  ⚠️  No temp folders found')
        continue
      }

      // Try each temp folder (ordered by newest first)
      for (const folder of tempFolders) {
        if (!folder.name) continue

        // List files in temp folder
        const { data: tempFiles } = await supabase.storage
          .from('head-images')
          .list(`temp/${folder.name}`)

        if (!tempFiles || tempFiles.length === 0) continue

        console.log(`  📁 Found temp folder with ${tempFiles.length} images: ${folder.name}`)

        let movedCount = 0

        // Move each image
        for (const file of tempFiles) {
          try {
            const tempPath = `temp/${folder.name}/${file.name}`
            const position = file.name.split('.')[0] // front.jpg -> front
            const finalPath = `${order.id}/${position}.jpg`

            // Download from temp
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('head-images')
              .download(tempPath)

            if (downloadError) {
              console.log(`    ❌ Error downloading ${position}:`, downloadError.message)
              continue
            }

            // Upload to final location
            const { error: uploadError } = await supabase.storage
              .from('head-images')
              .upload(finalPath, fileData, {
                contentType: 'image/jpeg',
                upsert: true,
              })

            if (uploadError) {
              console.log(`    ❌ Error uploading ${position}:`, uploadError.message)
              continue
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('head-images')
              .getPublicUrl(finalPath)

            // Create order_image record
            const { error: imageError } = await supabase
              .from('order_images')
              .insert({
                order_id: order.id,
                image_url: publicUrl,
                position,
              })

            if (imageError) {
              console.log(`    ❌ Error creating record for ${position}:`, imageError.message)
            } else {
              console.log(`    ✅ Moved ${position}`)
              movedCount++
            }

            // Delete temp file
            await supabase.storage.from('head-images').remove([tempPath])
          } catch (error) {
            console.log(`    ❌ Error processing ${file.name}:`, error)
          }
        }

        if (movedCount > 0) {
          console.log(`  ✅ Successfully moved ${movedCount} images for order ${order.id}`)
          break // Found and processed this order's images
        }
      }
    }

    console.log('\n✅ Migration complete!')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

moveTempImages()
