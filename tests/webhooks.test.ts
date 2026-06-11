/**
 * Jest + supertest tests for Stripe webhook handler
 * Mocks Stripe SDK and Prisma client to verify handler logic.
 */
import request from 'supertest'
import express from 'express'
import path from 'path'

// Mock Prisma: we will replace the actual lib/prisma with this mock
const prismaMock = {
  order: { update: jest.fn() },
  subscription: { create: jest.fn() },
}

const prismaPath = require.resolve('../lib/prisma')
jest.mock(prismaPath, () => ({ default: prismaMock }), { virtual: false })

// Mock Stripe SDK: constructEvent will simply parse the raw JSON body we send
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: (buf: Buffer) => JSON.parse(buf.toString()),
    },
  }))
})

describe('Stripe webhook handler', ()=>{
  let app: express.Express

  beforeAll(()=>{
    app = express()
    // raw body needed for webhook; handler itself will buffer the stream
    app.post('/api/webhooks/stripe', express.raw({ type: '*/*' }), (req, res) => {
      // import handler after mocks are in place
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const handler = require('../pages/api/webhooks/stripe').default
      return handler(req, res)
    })
  })

  beforeEach(()=>{
    jest.clearAllMocks()
  })

  test('payment_intent.succeeded updates order to PAID', async ()=>{
    const event = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_1', metadata: { orderId: 'order_1' } } }
    }

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send(JSON.stringify(event))
      .expect(200)

    expect(prismaMock.order.update).toHaveBeenCalledWith({ where: { id: 'order_1' }, data: { paymentStatus: 'PAID', paymentProviderId: 'pi_test_1' } })
  })

  test('invoice.payment_succeeded creates subscription when metadata present', async ()=>{
    const event = {
      type: 'invoice.payment_succeeded',
      data: { object: { id: 'inv_1', metadata: { orderId: 'order_2', userId: 'user_1', serviceId: 'svc_1' }, payment_intent: 'pi_2' } }
    }

    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send(JSON.stringify(event))
      .expect(200)

    expect(prismaMock.order.update).toHaveBeenCalledWith({ where: { id: 'order_2' }, data: { paymentStatus: 'PAID', paymentProviderId: 'pi_2' } })
    expect(prismaMock.subscription.create).toHaveBeenCalledWith({ data: { userId: 'user_1', serviceId: 'svc_1', status: 'ACTIVE' } })
  })
})
