// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Basic validation
    if (
      !body ||
      typeof body.firstName !== 'string' ||
      typeof body.email     !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'firstName and email are required.' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    const coll = db.collection('contacts')

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
      { status: 201 }
    )
  } catch (err) {
    console.error('🔥 POST /api/contact error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB_NAME)
    const coll = db.collection('contacts')

    const contacts = await coll
      .find()
      .sort({ createdAt: -1 })
      .toArray()

    // convert _id → string
    const sanitized = contacts.map((c) => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, contacts: sanitized })
  } catch (err) {
    console.error('🔥 GET /api/contact error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
