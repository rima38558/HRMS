import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { verifyPayuResponseHash } from '../../../../lib/payu'
import { sendChecklistEmail } from '../../../../lib/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const body = req.body || {}
  console.log('PayU webhook received', body)

  const key = process.env.PAYU_MERCHANT_KEY || process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || ''
  const salt = process.env.PAYU_MERCHANT_SALT || ''
  if (!key || !salt){
    console.warn('PayU credentials not configured')
    return res.status(400).send('Missing credentials')
  }

  const valid = verifyPayuResponseHash(body, salt, key)
  const txnid = body.txnid
  const status = (body.status || '').toString().toLowerCase()

  if (!txnid){
    console.warn('Missing txnid in webhook')
    return res.status(400).send('Missing txnid')
  }

  // Find matching order by payment provider id
  const order = await prisma.order.findFirst({ where: { paymentProviderId: txnid } })
  if (!order){
    console.warn('Order not found for txnid', txnid)
    return res.status(200).send('OK')
  }

  // Idempotency: if we've already recorded success, ignore duplicate webhooks
  if (order.paymentStatus === 'SUCCESS'){
    console.log('Payment already processed for order', order.id)
    return res.status(200).send('OK')
  }

  try{
    if (valid && status === 'success'){
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'SUCCESS' } })

      // send checklist email to user (best-effort)
      const user = await prisma.user.findUnique({ where: { id: order.userId } })
      if (user){
        try{
          const items = JSON.parse(order.items as unknown as string)
          const svcRef = items && items[0] && items[0].serviceId
          const service = await prisma.service.findUnique({ where: { id: svcRef } })
          const checklist = service?.checklist ? JSON.parse(service.checklist as unknown as string) : []
          await sendChecklistEmail(user.email, service?.title || 'Service', checklist)
        }catch(e){ console.warn('Failed to send checklist email', e) }
      }
    }else{
      // mark failed if signature invalid or status not success
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } })
    }
  }catch(e:any){
    console.error('Error processing PayU webhook', e)
    // Do not return 500 to provider — log and return 200 so provider won't retry endlessly
  }

  return res.status(200).send('OK')
}
