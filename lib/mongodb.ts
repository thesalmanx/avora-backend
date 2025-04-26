// lib/mongodb.ts
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const options = {}

type GlobalWithClient = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

const g = globalThis as GlobalWithClient

if (!g._mongoClientPromise) {
  const client = new MongoClient(uri, options)
  g._mongoClientPromise = client.connect()
}

export default g._mongoClientPromise!
