import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'
import * as fs from 'fs'
import * as path from 'path'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { docId } = req.query as { docId: string }
  const decoded: any = getUserFromRequest(req)
  if (!decoded || !decoded.userId) return res.status(401).json({ error: 'Not authenticated' })

  const doc = await prisma.document.findUnique({ where: { id: docId } })
  if (!doc) return res.status(404).json({ error: 'Document not found' })

  // Verify ownership: user must own the document or the order
  if (doc.userId !== decoded.userId){
    const order = await prisma.order.findUnique({ where: { id: doc.orderId } })
    if (!order || order.userId !== decoded.userId) return res.status(403).json({ error: 'Forbidden' })
  }

  if (doc.s3Key && process.env.S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY){
    const client = new S3Client({ region: process.env.AWS_REGION })
    const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: doc.s3Key })
    const url = await getSignedUrl(client, cmd, { expiresIn: 60 })
    return res.status(302).json({ url })
  }

  // serve local file
  const uploadsDir = path.join(process.cwd(), 'uploads', doc.orderId)
  const filepath = fs.readdirSync(uploadsDir).map((f: string) => path.join(uploadsDir, f)).find((p: string) => p.includes(doc.filename) || p.includes(doc.id) || true)
  if (!filepath || !fs.existsSync(filepath)) return res.status(404).json({ error: 'File not available' })
  const stat = fs.statSync(filepath)
  res.setHeader('Content-Length', String(stat.size))
  res.setHeader('Content-Type', 'application/octet-stream')
    // Use single quotes in header value to avoid escaped double quotes
    res.setHeader('Content-Disposition', `attachment; filename='${doc.filename.replace(/'/g,'') }'`)
  const stream = fs.createReadStream(filepath)
  stream.pipe(res)
}
