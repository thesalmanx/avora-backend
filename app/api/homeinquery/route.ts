import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Enable CORS manually
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*'); // or restrict to your frontend domain
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  return setCorsHeaders(response);
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const coll = db.collection('homeInquiries');

    const docs = await coll.find().sort({ createdAt: -1 }).toArray();
    const enquiries = docs.map(doc => ({
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      country: doc.country,
      createdAt: doc.createdAt.toISOString(),
    }));

    const response = NextResponse.json({ success: true, enquiries });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('GET /api/homeinquery error:', error);
    const response = NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    return setCorsHeaders(response);
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, country } = await request.json();

    if (!name || !email || !phone || !country) {
      const response = NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
      return setCorsHeaders(response);
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const coll = db.collection('homeInquiries');

    const result = await coll.insertOne({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      createdAt: new Date(),
    });

    const response = NextResponse.json({ success: true, _id: result.insertedId.toString() });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('POST /api/homeinquery error:', error);
    const response = NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    return setCorsHeaders(response);
  }
}
