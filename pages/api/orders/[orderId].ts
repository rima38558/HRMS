import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const user = getUserFromRequest(req)
  if (!user || !user.userId) return res.status(401).json({ error: 'Not authenticated' })

  const { orderId } = req.query
  if (!orderId) return res.status(400).json({ error: 'orderId required' })

  try{
    const order = await prisma.order.findUnique({ where: { id: String(orderId) } })
    if (!order) return res.status(404).json({ error: 'Not found' })
    // ensure user owns the order or is admin
    if (order.userId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })
    return res.status(200).json({ order })
  }catch(e:any){
    console.error('Fetch order failed', e)
    return res.status(500).json({ error: 'Fetch failed' })
  }
}
