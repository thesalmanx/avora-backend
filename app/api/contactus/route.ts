// app/api/contactus/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// allow any origin for dev; lock down in prod
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// handle preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // basic validation
    if (
      typeof body.name !== 'string' ||
      typeof body.email !== 'string' ||
      typeof body.phone !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'name, email and phone are required.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    const coll = db.collection('contactus')   // note new collection name

    const doc = {
      name:            body.name.trim(),
      email:           body.email.trim(),
      phone:           body.phone.trim(),
      projectInterest: (body.projectInterest || '').trim(),
      message:         body.message.trim(),
      createdAt:       new Date(),
    }

    const result = await coll.insertOne(doc)
    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('🔥 POST /api/contactus error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    const coll = db.collection('contactus')

    // sort newest first
    const items = await coll.find().sort({ createdAt: -1 }).toArray()
    const sanitized = items.map((i) => ({
      _id:             i._id.toString(),
      name:            i.name,
      email:           i.email,
      phone:           i.phone,
      projectInterest: i.projectInterest,
      message:         i.message,
      createdAt:       i.createdAt.toISOString(),
    }))

    return NextResponse.json(
      { success: true, entries: sanitized },
      { headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('🔥 GET /api/contactus error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
