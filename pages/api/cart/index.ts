import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const user = getUserFromRequest(req)
  if (!user || !user.userId) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET'){
    const cart = await prisma.cart.findUnique({ where: { userId: user.userId } })
    return res.status(200).json({ cart: cart || null })
  }

  if (req.method === 'PUT'){
    const items = req.body.items || []
    const data = { items }
    const existing = await prisma.cart.findUnique({ where: { userId: user.userId } })
    if (existing){
      const updated = await prisma.cart.update({ where: { id: existing.id }, data })
      return res.status(200).json({ cart: updated })
    }else{
      const created = await prisma.cart.create({ data: { userId: user.userId, items } })
      return res.status(201).json({ cart: created })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
