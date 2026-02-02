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

async function cleanStorage() {
  console.log('🧹 Cleaning storage bucket...\n')

  try {
    // List all files in the head-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('head-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (listError) {
      console.error('❌ Error listing files:', listError.message)
      return
    }

    if (!files || files.length === 0) {
      console.log('✅ Storage bucket is already empty!')
      return
    }

    console.log(`📁 Found ${files.length} folders to delete\n`)

    // Delete all folders (which will delete all files inside)
    for (const file of files) {
      if (file.name) {
        // List all files in this folder
        const { data: folderFiles, error: folderListError } = await supabase.storage
          .from('head-images')
          .list(file.name)

        if (folderListError) {
          console.error(`❌ Error listing files in ${file.name}:`, folderListError.message)
          continue
        }

        if (folderFiles && folderFiles.length > 0) {
          // Delete all files in the folder
          const filePaths = folderFiles.map(f => `${file.name}/${f.name}`)
          const { error: deleteError } = await supabase.storage
            .from('head-images')
            .remove(filePaths)

          if (deleteError) {
            console.error(`❌ Error deleting files in ${file.name}:`, deleteError.message)
          } else {
            console.log(`✅ Deleted ${filePaths.length} files from ${file.name}`)
          }
        }
      }
    }

    console.log('\n✅ Storage cleanup complete!')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

cleanStorage()
