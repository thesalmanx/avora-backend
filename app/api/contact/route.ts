// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Change this to your exact front-end origin(s) in production:
const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://your-production-domain.com']

// Basic CORS headers:
const getCorsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin':
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
})

export async function OPTIONS(req: NextRequest) {
  // Preflight request handler
  const origin = req.headers.get('origin')
  return NextResponse.json(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = getCorsHeaders(origin)

  try {
    const body = await req.json()

    if (
      !body ||
      typeof body.firstName !== 'string' ||
      typeof body.email !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'firstName and email are required.' },
        { status: 400, headers }
      )
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    const coll = db.collection('contacts')

    const doc = {
      firstName: body.firstName.trim(),
      lastName: (body.lastName || '').trim(),
      email: body.email.trim(),
      phone: (body.phone || '').trim(),
      country: body.country || '',
      message: (body.message || '').trim(),
      createdAt: new Date(),
    }

    const result = await coll.insertOne(doc)
    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201, headers }
    )
  } catch (err) {
    console.error('🔥 POST /api/contact error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers }
    )
  }
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = getCorsHeaders(origin)

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    const coll = db.collection('contacts')

    const contacts = await coll.find().sort({ createdAt: -1 }).toArray()
    const sanitized = contacts.map((c) => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, contacts: sanitized }, { headers })
  } catch (err) {
    console.error('🔥 GET /api/contact error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers }
    )
  }
}
