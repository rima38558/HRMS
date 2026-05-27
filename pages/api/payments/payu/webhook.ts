import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { verifyPayuResponseHash } from '../../../../lib/payu'
import { sendChecklistEmail } from '../../../../lib/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  // Accept POST from PayU, validate signature and update order/payment status
  const body = req.body
  console.log('PayU webhook received', body)

  const key = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || ''
  const salt = process.env.PAYU_MERCHANT_SALT || ''
  const valid = verifyPayuResponseHash(body, salt, key)

  const txnid = body.txnid
  const status = body.status

  const order = await prisma.order.findFirst({ where: { paymentProviderId: txnid } })
  if (!order){
    console.warn('Order not found for txnid', txnid)
    return res.status(200).send('OK')
  }

  if (valid && status === 'success'){
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'SUCCESS' } })
    // send checklist email to user
    const user = await prisma.user.findUnique({ where: { id: order.userId } })
    if (user){
      // extract checklist from service
      try{
        const items = JSON.parse(order.items as unknown as string)
        const svcRef = items && items[0] && items[0].serviceId
        const service = await prisma.service.findUnique({ where: { id: svcRef } })
        const checklist = service?.checklist ? JSON.parse(service.checklist as unknown as string) : []
        await sendChecklistEmail(user.email, service?.title || 'Service', checklist)
      }catch(e){ console.warn('Failed to send checklist email', e) }
    }
  }else{
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } })
  }

  res.status(200).send('OK')
}
