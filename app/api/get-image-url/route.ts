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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Extract the path from the public URL if needed
    const pathParts = path.split('/head-images/')
    const filePath = pathParts[pathParts.length - 1]

    // Generate a signed URL valid for 1 hour
    const { data, error } = await supabase.storage
      .from('head-images')
      .createSignedUrl(filePath, 3600)

    if (error) {
      console.error('Error creating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to create signed URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (error) {
    console.error('Get image URL error:', error)
    return NextResponse.json(
      { error: 'Failed to get image URL' },
      { status: 500 }
    )
  }
}
