import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { orderId } = req.query as { orderId: string }
  const { filename, data, serviceId } = req.body
  if (!filename || !data) return res.status(400).json({ error: 'Missing file data' })

  const decoded: any = getUserFromRequest(req)
  if (!decoded || !decoded.userId) return res.status(401).json({ error: 'Not authenticated' })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.userId !== decoded.userId) return res.status(403).json({ error: 'Not allowed' })

  // decode base64
  const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
  let buffer: Buffer
  if (matches){
    buffer = Buffer.from(matches[2], 'base64')
  }else{
    buffer = Buffer.from(data, 'base64')
  }

  const s3Bucket = process.env.S3_BUCKET
  const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`

  let s3Key: string | null = null

  if (s3Bucket && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY){
    // upload to S3
    try{
      const client = new S3Client({ region: process.env.AWS_REGION })
      const key = `orders/${orderId}/${safeName}`
      await client.send(new PutObjectCommand({ Bucket: s3Bucket, Key: key, Body: buffer }))
      s3Key = key
    }catch(e){
      console.error('S3 upload failed, falling back to local', e)
    }
  }

  let localPath: string | null = null
  if (!s3Key){
    const uploadsDir = path.join(process.cwd(), 'uploads', orderId)
    fs.mkdirSync(uploadsDir, { recursive: true })
    const filepath = path.join(uploadsDir, safeName)
    fs.writeFileSync(filepath, buffer)
    localPath = `/uploads/${orderId}/${safeName}`
  }

  const doc = await prisma.document.create({ data: { orderId: order.id, serviceId: serviceId || null, userId: decoded.userId, filename, s3Key } })

  res.status(200).json({ message: 'Uploaded', docId: doc.id, path: s3Key ? `s3://${s3Bucket}/${s3Key}` : localPath })
}
