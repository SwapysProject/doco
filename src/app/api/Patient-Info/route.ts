import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// 👇 GET: Fetch all patient records
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('Patient') // Use your database name
    const collection = db.collection('Patient Info') // Exact collection name

    const data = await collection.find({}).toArray()

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET /patient-info]', error)
    return NextResponse.json({ success: false, error: 'Fetch failed' }, { status: 500 })
  }
}

// 👇 POST: Add a new patient record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const client = await clientPromise
    const db = client.db('Patient')
    const collection = db.collection('Patient Info')

    const result = await collection.insertOne(body)

    return NextResponse.json({ success: true, insertedId: result.insertedId })
  } catch (error) {
    console.error('[POST /patient-info]', error)
    return NextResponse.json({ success: false, error: 'Create failed' }, { status: 500 })
  }
}

// 👇 PUT: Update a patient record by _id
export async function PUT(req: NextRequest) {
  try {
    const { _id, updates } = await req.json()

    // Validate _id and updates
    if (!_id || typeof _id !== 'string' || !updates) {
      return NextResponse.json({ success: false, error: 'Invalid _id or updates' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('Patient')
    const collection = db.collection('Patient Info')

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updates }
    )

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error('[PUT /patient-info]', error)
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}

// 👇 DELETE: Remove a patient record by _id
export async function DELETE(req: NextRequest) {
  try {
    const { _id } = await req.json()

    if (!_id || typeof _id !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing or invalid _id' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('Patient')
    const collection = db.collection('Patient Info')

    const result = await collection.deleteOne({ _id: new ObjectId(_id) })

    return NextResponse.json({ success: true, deletedCount: result.deletedCount })
  } catch (error) {
    console.error('[DELETE /patient-info]', error)
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
  }
}
