import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

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

    return NextResponse.json({ success: true, enquiries });
  } catch (error) {
    console.error('GET /api/homeinquery error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, country } = await request.json();

    // Validation
    if (!name || !email || !phone || !country) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
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

    return NextResponse.json({ success: true, _id: result.insertedId.toString() });
  } catch (error) {
    console.error('POST /api/homeinquery error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
