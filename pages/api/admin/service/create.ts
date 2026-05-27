import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { isAdminRequest } from '../../../../lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ok = await isAdminRequest(req)
  if (!ok) return res.status(403).json({ error: 'Forbidden' })

  const { title, description, price, gstRate, checklist } = req.body
  if (!title || !price) return res.status(400).json({ error: 'Missing fields' })
  try{
    const svc = await prisma.service.create({ data: { title, description: description || '', price: Number(price), gstRate: Number(gstRate || 0), checklist: checklist ? JSON.stringify(checklist) : null } })
    res.status(200).json({ service: svc })
  }catch(e:any){
    res.status(500).json({ error: e.message })
  }
}
