import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = getUserFromRequest(req)
  if (!user || !user.userId) return res.status(401).json({ error: 'Not authenticated' })

  const { serviceId, quantity = 1 } = req.body
  if (!serviceId) return res.status(400).json({ error: 'serviceId required' })

  const existing = await prisma.cart.findUnique({ where: { userId: user.userId } })
  const items = existing?.items || []
  const idx = items.findIndex((it:any)=>String(it.serviceId) === String(serviceId))
  if (idx >= 0){
    items[idx].quantity = (items[idx].quantity || 1) + quantity
  }else{
    items.push({ serviceId, quantity })
  }

  if (existing){
    const updated = await prisma.cart.update({ where: { id: existing.id }, data: { items } })
    return res.status(200).json({ cart: updated })
  }else{
    const created = await prisma.cart.create({ data: { userId: user.userId, items } })
    return res.status(201).json({ cart: created })
  }
}
