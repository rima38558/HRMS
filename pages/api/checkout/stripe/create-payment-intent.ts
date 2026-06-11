import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'
// Stripe SDK
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

  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe secret key not configured' })

  try{
    const amount = Math.round(Number(order.total || 0) * 100)
    // derive serviceIds from order.items (stored as JSON string)
    let serviceIds: string[] = []
    try{
      const items = JSON.parse(order.items || '[]')
      serviceIds = items.map((it:any)=>String(it.serviceId)).filter(Boolean)
    }catch(e){}

    const metadata: Record<string,string> = { orderId: order.id, userId: order.userId }
    if (serviceIds.length) metadata.serviceId = serviceIds.join(',')

    const pi = await stripe.paymentIntents.create({ amount, currency: process.env.STRIPE_CURRENCY || 'inr', metadata })
    return res.status(200).json({ clientSecret: pi.client_secret })
  }catch(e:any){
    console.error('Create PaymentIntent failed', e)
    return res.status(500).json({ error: 'PaymentIntent creation failed' })
  }
}
