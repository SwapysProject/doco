// src/pages/api/customers.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise
    const db = client.db('sample_analytics')
    const customers = await db.collection('customers').find({}).limit(5).toArray()

    res.status(200).json(customers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
}
