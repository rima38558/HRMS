import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = getUserFromRequest(req)
  if (!user || !user.userId) return res.status(401).json({ error: 'Not authenticated' })

  const { orderId } = req.body
  if (!orderId) return res.status(400).json({ error: 'orderId required' })

  const order = await prisma.order.findUnique({ where: { id: String(orderId) } })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.userId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  try{
    const items = JSON.parse(order.items || '[]')
    const line_items = items.map((it:any)=>({ price_data: { currency: process.env.STRIPE_CURRENCY || 'inr', product_data: { name: it.title || 'Service' }, unit_amount: Math.round((it.price || 0)*100) }, quantity: Number(it.quantity || 1) }))

    const serviceIds = items.map((it:any)=>String(it.serviceId)).filter(Boolean)
    const metadata: Record<string,string> = { orderId: order.id, userId: order.userId }
    if (serviceIds.length) metadata.serviceId = serviceIds.join(',')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${order.id}?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${order.id}?status=cancelled`,
      metadata,
    })

    return res.status(200).json({ url: session.url, id: session.id })
  }catch(e:any){
    console.error('Create checkout session failed', e)
    return res.status(500).json({ error: 'Checkout session creation failed' })
  }
}
