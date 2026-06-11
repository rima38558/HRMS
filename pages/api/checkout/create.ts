import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'
import { generateTxnId, generatePayuHash } from '../../../lib/payu'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = getUserFromRequest(req)
  if (!user || !user.userId) return res.status(401).json({ error: 'Not authenticated' })

  const { items = [], couponCode } = req.body

  // fetch service details
  const serviceIds = items.map((it:any)=>it.serviceId)
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } })

  // calculate subtotal
  let subtotal = 0
  const lineItems: any[] = []
  for (const it of items){
    const svc = services.find(s=>String(s.id) === String(it.serviceId))
    if (!svc) continue
    const qty = Number(it.quantity || 1)
    const price = Number(svc.price || 0)
    const lineTotal = price * qty
    subtotal += lineTotal
    lineItems.push({ serviceId: svc.id, title: svc.title, price, quantity: qty, lineTotal })
  }

  // apply coupon
  let discount = 0
  let coupon = null
  if (couponCode){
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
    if (coupon && coupon.active){
      if (coupon.amount) discount = coupon.amount
      else if (coupon.percent) discount = subtotal * (coupon.percent/100)
    }
  }

  const tax = subtotal * 0.18 // simplified 18% GST
  const total = Math.max(0, subtotal + tax - discount)

  // create order
  const txnid = generateTxnId()
  const order = await prisma.order.create({ data: {
    userId: user.userId,
    items: JSON.stringify(lineItems),
    subtotal,
    tax,
    discount,
    total,
    paymentStatus: 'PENDING',
    paymentProvider: 'PAYU',
    paymentProviderId: txnid,
  }})

  // prepare payu params if configured
  const key = process.env.PAYU_MERCHANT_KEY || ''
  const salt = process.env.PAYU_MERCHANT_SALT || ''
  let payu = null
  if (key && salt){
    const payuData = {
      key,
      txnid,
      amount: total,
      productinfo: 'Services purchase',
      firstname: user.name || user.email || 'Customer',
      email: user.email,
    }
    const hash = generatePayuHash({ ...payuData, salt })
    payu = { ...payuData, hash }
  }

  res.status(201).json({ ok: true, order, payu })
}
