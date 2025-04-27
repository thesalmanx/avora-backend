import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      typeof body.name !== 'string' ||
      typeof body.email !== 'string' ||
      typeof body.phone !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Name, email and phone are required.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const client = await clientPromise;
    const coll = client.db(process.env.MONGODB_DB_NAME).collection('brochureLeads');

    const doc = {
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      userType: typeof body.userType === 'string' ? body.userType.trim() : '',
      property: typeof body.property === 'string' ? body.property.trim() : '',
      createdAt: new Date(),
    };

    const result = await coll.insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('🔥 POST /api/brochurelead error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const coll = client.db(process.env.MONGODB_DB_NAME).collection('brochureLeads');

    const leads = await coll.find().sort({ createdAt: -1 }).toArray();
    const sanitized = leads.map((lead) => ({
      ...lead,
      _id: lead._id.toString(),
      createdAt: lead.createdAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, leads: sanitized },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('🔥 GET /api/brochurelead error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
