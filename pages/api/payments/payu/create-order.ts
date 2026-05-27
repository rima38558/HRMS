import type { NextApiRequest, NextApiResponse } from 'next'
import { generateTxnId, generatePayuHash } from '../../../../lib/payu'
import prisma from '../../../../lib/prisma'
import { getUserFromRequest } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { serviceId } = req.body
  if (!serviceId) return res.status(400).json({ error: 'Missing serviceId' })

  const decoded: any = getUserFromRequest(req)
  if (!decoded || !decoded.userId) return res.status(401).json({ error: 'Not authenticated' })

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return res.status(404).json({ error: 'Service not found' })

  const tax = (service.price * (service.gstRate || 0)) / 100
  const amount = Number((service.price + tax).toFixed(2))

  const txnid = generateTxnId()

  // create order in DB
  const order = await prisma.order.create({ data: {
    userId: user.id,
    amount: service.price,
    tax: tax,
    total: amount,
    paymentProviderId: txnid,
    paymentStatus: 'PENDING',
    items: JSON.stringify([{ serviceId: service.id, title: service.title, price: service.price }])
  } })

  const key = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || ''
  const salt = process.env.PAYU_MERCHANT_SALT || ''

  const firstname = user.name || ''
  const email = user.email || ''

  const productinfo = service.title

  const hash = generatePayuHash({ key, txnid, amount, productinfo, firstname, email, salt })

  const mode = process.env.NEXT_PUBLIC_PAYU_MODE === 'production' ? 'production' : 'sandbox'
  const actionUrl = mode === 'production' ? 'https://secure.payu.in/_payment' : 'https://sandboxsecure.payu.in/_payment'

  res.status(200).json({
    orderId: order.id,
    action: actionUrl,
    params: {
      key,
      txnid,
      amount: String(amount),
      productinfo,
      firstname,
      email,
      phone: user.mobile || '',
      surl: process.env.NEXT_PUBLIC_PAYU_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/payments/success`,
      furl: process.env.NEXT_PUBLIC_PAYU_FAIL_URL || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/payments/fail`,
      hash,
    }
  })
}
