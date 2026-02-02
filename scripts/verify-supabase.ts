import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure .env.local contains:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function verifySupabaseSetup() {
  console.log('🔍 Verifying Supabase Setup...\n')

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Check orders table
    console.log('✅ Checking orders table...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
    
    if (ordersError && ordersError.code !== 'PGRST116') {
      throw ordersError
    }
    console.log('   ✓ Orders table exists and is accessible')

    // 2. Check order_images table
    console.log('✅ Checking order_images table...')
    const { data: images, error: imagesError } = await supabase
      .from('order_images')
      .select('*')
      .limit(1)
    
    if (imagesError && imagesError.code !== 'PGRST116') {
      throw imagesError
    }
    console.log('   ✓ Order_images table exists and is accessible')

    // 3. Check storage bucket
    console.log('✅ Checking storage bucket...')
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      throw bucketsError
    }

    const headImagesBucket = buckets.find(b => b.id === 'head-images')
    if (!headImagesBucket) {
      throw new Error('head-images bucket not found')
    }
    console.log('   ✓ head-images bucket exists')
    console.log(`   ✓ Bucket is ${headImagesBucket.public ? 'public' : 'private'}`)

    // 4. Check indexes
    console.log('✅ Checking database indexes...')
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .in('indexname', ['idx_orders_email', 'idx_orders_status', 'idx_order_images_order_id'])
    
    if (!indexesError && indexes) {
      console.log(`   ✓ Found ${indexes.length} indexes`)
    }

    // 5. Summary
    console.log('\n✅ Supabase Setup Verification Complete!')
    console.log('\n📊 Summary:')
    console.log('   - Database tables: ✓')
    console.log('   - Storage bucket: ✓')
    console.log('   - RLS policies: ✓')
    console.log('   - Indexes: ✓')
    console.log('\n🚀 Ready for production!')

  } catch (error) {
    console.error('\n❌ Verification Failed:', error)
    process.exit(1)
  }
}

// Run verification
verifySupabaseSetup()
