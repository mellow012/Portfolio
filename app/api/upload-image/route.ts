  import { NextRequest, NextResponse } from 'next/server'
  import { put } from '@vercel/blob'
  import { getAdminAuth } from '../../../lib/firebaseAdmin'

  export async function POST(request: NextRequest) {
    try {
      // Verify authentication
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const token = authHeader.slice(7)
      const auth = getAdminAuth()
      
      const decodedToken = await auth.verifyIdToken(token)
      const uid = decodedToken.uid

      // Parse multipart form data
      const formData = await request.formData()
      const file = formData.get('file') as File
      const path = formData.get('path') as string

      if (!file || !path) {
        return NextResponse.json(
          { error: 'Missing file or path' },
          { status: 400 }
        )
      }

      // Validate file size (3MB max)
      if (file.size > 3 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds 3MB limit' },
          { status: 400 }
        )
      }

      // Upload to Vercel Blob
      console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
      console.log('Token length:', process.env.BLOB_READ_WRITE_TOKEN?.length)
      const blob = await put(path, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      return NextResponse.json({ url: blob.url })
    } catch (error: any) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: 500 }
      )
    }
  }
