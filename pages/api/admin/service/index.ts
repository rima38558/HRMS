import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const user = getUserFromRequest(req)
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin required' })

  if (req.method === 'GET'){
    const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json({ services })
  }

  if (req.method === 'POST'){
    const { title, slug, description, price = 0, isRecurring = false, billingInterval = null, active = true } = req.body
    try{
      const svc = await prisma.service.create({ data: { title, slug, description, price: Number(price), isRecurring, billingInterval, active } })
      return res.status(201).json({ service: svc })
    }catch(e:any){
      console.error('Create service failed', e)
      return res.status(500).json({ error: 'Create failed' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
