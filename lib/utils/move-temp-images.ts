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

export async function moveTempImagesToOrder(orderId: string): Promise<number> {
  console.log('🔍 Looking for temp images for order:', orderId)
  
  try {
    // List all temp folders (sorted by newest first)
    const { data: tempFolders, error: listError } = await supabase.storage
      .from('head-images')
      .list('temp', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (listError || !tempFolders || tempFolders.length === 0) {
      console.log('📂 No temp folders found')
      return 0
    }

    console.log(`📁 Found ${tempFolders.length} temp folders to check`)

    // Try each temp folder (newest first - most likely to be the right one)
    for (const folder of tempFolders) {
      if (!folder.name || !folder.name.startsWith('temp_')) continue

      // List files in this temp folder
      const { data: tempFiles } = await supabase.storage
        .from('head-images')
        .list(`temp/${folder.name}`)

      if (!tempFiles || tempFiles.length === 0) continue

      console.log(`📁 Checking temp/${folder.name} with ${tempFiles.length} files`)

      let movedCount = 0
      const positions = ['front', 'back', 'left', 'right', 'top']

      // Try to move all 5 standard positions
      for (const position of positions) {
        const imageFile = tempFiles.find(f => f.name.startsWith(position))
        if (!imageFile) continue

        try {
          const tempPath = `temp/${folder.name}/${imageFile.name}`
          const finalPath = `${orderId}/${position}.jpg`

          // Download from temp
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('head-images')
            .download(tempPath)

          if (downloadError) {
            console.error(`❌ Download error for ${position}:`, downloadError.message)
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
            console.error(`❌ Upload error for ${position}:`, uploadError.message)
            continue
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('head-images')
            .getPublicUrl(finalPath)

          // Check if order_image record already exists for this position
          const { data: existingRecord } = await supabase
            .from('order_images')
            .select('id')
            .eq('order_id', orderId)
            .eq('position', position)
            .single()

          if (existingRecord) {
            console.log(`ℹ️  Image ${position} already exists for order ${orderId}, skipping`)
            movedCount++
            continue
          }

          // Create order_image record
          const { error: imageError } = await supabase
            .from('order_images')
            .insert({
              order_id: orderId,
              image_url: publicUrl,
              position,
            })

          if (!imageError) {
            movedCount++
            console.log(`✅ Moved ${position} for order ${orderId}`)
          }

          // Delete temp file
          await supabase.storage.from('head-images').remove([tempPath])
        } catch (error) {
          console.error(`Error moving ${position}:`, error)
        }
      }

      // If we successfully moved images, we're done
      if (movedCount > 0) {
        console.log(`✅ Successfully moved ${movedCount} images from temp/${folder.name}`)
        return movedCount
      }
    }

    console.log('⚠️  No matching temp images found')
    return 0
  } catch (error) {
    console.error('❌ Error moving temp images:', error)
    return 0
  }
}
