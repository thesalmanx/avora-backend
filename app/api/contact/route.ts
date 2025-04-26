// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Wildcard CORS for dev; lock it down in prod if you like
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Preflight (no need for the request object here)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

// POST needs the req to parse the body
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (
      typeof body.firstName !== 'string' ||
      typeof body.email     !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'firstName and email are required.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const client = await clientPromise
    const coll = client
      .db(process.env.MONGODB_DB_NAME)
      .collection('contacts')

    const doc = {
      firstName: body.firstName.trim(),
      lastName:  (body.lastName  || '').trim(),
      email:     body.email.trim(),
      phone:     (body.phone     || '').trim(),
      country:   body.country    || '',
      message:   (body.message   || '').trim(),
      createdAt: new Date(),
    }

    const result = await coll.insertOne(doc)

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('🔥 POST /api/contact error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// GET doesn’t need the request object either
export async function GET() {
  try {
    const client = await clientPromise
    const coll = client
      .db(process.env.MONGODB_DB_NAME)
      .collection('contacts')

    const contacts = await coll.find().sort({ createdAt: -1 }).toArray()
    const sanitized = contacts.map((c) => ({
      ...c,
      _id:       c._id.toString(),
      createdAt: c.createdAt.toISOString(),
    }))

    return NextResponse.json(
      { success: true, contacts: sanitized },
      { headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('🔥 GET /api/contact error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
