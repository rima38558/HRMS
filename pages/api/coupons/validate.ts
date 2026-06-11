import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { code, subtotal = 0 } = req.body
  if (!code) return res.status(400).json({ error: 'code required' })

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return res.status(404).json({ valid: false, reason: 'Coupon not found' })
  if (!coupon.active) return res.status(400).json({ valid: false, reason: 'Coupon inactive' })
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return res.status(400).json({ valid: false, reason: 'Coupon expired' })

  // compute discount
  let discount = 0
  if (coupon.amount){
    discount = coupon.amount
  }else if (coupon.percent){
    discount = (Number(subtotal) * coupon.percent) / 100
  }

  res.status(200).json({ valid: true, discount })
}
