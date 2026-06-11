import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

async function buffer(req: NextApiRequest){
  return new Promise<Buffer>((resolve, reject)=>{
    const chunks: any[] = []
    req.on('data', (chunk)=>chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk))
    req.on('end', ()=>resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const sig = req.headers['stripe-signature'] as string | undefined
  if (!sig) return res.status(400).send('Missing stripe signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const buf = await buffer(req)

  let event: Stripe.Event
  try{
    if (!webhookSecret) throw new Error('Webhook secret not configured')
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  }catch(err:any){
    console.error('Stripe webhook signature verification failed', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try{
    const type = event.type
    console.log('Stripe webhook received:', type)

    if (type === 'payment_intent.succeeded'){
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata?.orderId as string | undefined
      if (orderId){
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', paymentProviderId: pi.id } })
      }
    }

    if (type === 'payment_intent.payment_failed'){
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata?.orderId as string | undefined
      if (orderId){
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED', paymentProviderId: pi.id } })
      }
    }

    if (type === 'invoice.payment_succeeded'){
      const invoice = event.data.object as Stripe.Invoice
      const orderId = invoice.metadata?.orderId as string | undefined
      if (orderId){
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', paymentProviderId: invoice.payment_intent as string } })
      }
      // If subscription info present and metadata includes userId/serviceId, create subscription
      const userId = invoice.metadata?.userId as string | undefined
      const serviceId = invoice.metadata?.serviceId as string | undefined
      if (userId && serviceId){
        await prisma.subscription.create({ data: { userId, serviceId, status: 'ACTIVE' } })
      }
    }

    if (type === 'invoice.payment_failed'){
      const invoice = event.data.object as Stripe.Invoice
      const orderId = invoice.metadata?.orderId as string | undefined
      if (orderId){
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'FAILED' } })
      }
    }

    if (type === 'customer.subscription.created' || type === 'customer.subscription.updated'){
      const sub = event.data.object as Stripe.Subscription
      const metadata = sub.metadata || {}
      const userId = metadata.userId as string | undefined
      const serviceId = metadata.serviceId as string | undefined
      if (userId && serviceId){
        // upsert subscription by metadata (no stripeId field in schema), create simple record
        await prisma.subscription.create({ data: { userId, serviceId, status: String(sub.status), startedAt: new Date(sub.start_date * 1000) } })
      }
    }

    if (type === 'checkout.session.completed'){
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId as string | undefined
      if (orderId){
        // mark order paid if payment_status is paid
        const paid = session.payment_status === 'paid'
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: paid ? 'PAID' : 'PENDING', paymentProviderId: session.payment_intent as string } })
      }
    }

    res.status(200).json({ received: true })
  }catch(err:any){
    console.error('Webhook handling error', err)
    res.status(500).send('Webhook handler error')
  }
}
