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

// Upload temporary image before checkout (will be moved to final location after payment)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const position = formData.get('position') as string
    const tempId = formData.get('tempId') as string // Unique session ID

    if (!imageFile || !position || !tempId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique filename in temp folder
    const fileExt = imageFile.name.split('.').pop() || 'jpg'
    const fileName = `temp/${tempId}/${position}.${fileExt}`

    // Upload to Supabase Storage (temp folder)
    const { data, error: uploadError } = await supabase.storage
      .from('head-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: true, // Allow replacing if re-uploading
      })

    if (uploadError) {
      console.error('Error uploading temp image:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('head-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      position,
    })
  } catch (error) {
    console.error('Upload temp image error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
