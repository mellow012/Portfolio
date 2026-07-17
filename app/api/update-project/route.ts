import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '../../../lib/firebaseAdmin'

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const auth = getAdminAuth()
    const db = getAdminDb()
    
    const decodedToken = await auth.verifyIdToken(token)
    const uid = decodedToken.uid

    // Only admin can update
    if (uid !== ADMIN_UID) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, updates } = body

    if (!projectId || !updates) {
      return NextResponse.json(
        { error: 'Missing projectId or updates' },
        { status: 400 }
      )
    }

    // Update project
    await db.collection('projects').doc(projectId).update({
      ...updates,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    )
  }
}
