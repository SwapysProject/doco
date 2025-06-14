// pages/api/test-mongo.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise
    const db = client.db('sample_analytics') // use the same name from .env.local
    const collections = await db.listCollections().toArray()

    res.status(200).json({ message: 'Connected to MongoDB!', collections })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to connect to MongoDB' })
  }
}
