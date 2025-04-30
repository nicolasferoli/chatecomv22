import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filename = formData.get('filename') as string

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract file extension
    const extension = filename.split('.').pop()

    // Generate unique filename with original extension
    const uniqueFilename = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media') // Your bucket name
      .upload(uniqueFilename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading to Supabase:', error)
      return Response.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(uniqueFilename)

    return Response.json({
      success: true,
      url: publicUrl,
      filename: filename,
    })
  } catch (error) {
    console.error('Error processing upload:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
