import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      }, { status: 500 })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)

    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: tablesError.message,
      }, { status: 500 })
    }

    // Test storage bucket
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: 'Storage query failed',
        details: bucketsError.message,
      }, { status: 500 })
    }

    const headImagesBucket = buckets.find(b => b.id === 'head-images')

    return NextResponse.json({
      success: true,
      message: 'Supabase connected successfully!',
      connection: {
        url: supabaseUrl,
        database: 'Connected ✓',
        storage: headImagesBucket ? 'Connected ✓' : 'Bucket not found',
        ordersTable: 'Accessible ✓',
        bucketName: headImagesBucket?.name || 'N/A',
        bucketPublic: headImagesBucket?.public || false,
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
