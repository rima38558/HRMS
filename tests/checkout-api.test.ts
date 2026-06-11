import request from 'supertest'
import express from 'express'

// Mock prisma used by handlers
const prismaMock = {
  service: { findMany: jest.fn() },
  order: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
}
jest.mock('../lib/prisma', () => ({ default: prismaMock }))

// Mock auth to return a test user
jest.mock('../lib/auth', () => ({ getUserFromRequest: () => ({ userId: 'user_1', email: 'test@example.com', role: 'USER', name: 'Test User' }) }))

// Mock Stripe SDK
const mockPaymentIntentsCreate = jest.fn()
const mockCheckoutCreate = jest.fn()
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: { create: mockPaymentIntentsCreate },
    checkout: { sessions: { create: mockCheckoutCreate } },
  }))
})

describe('Checkout API endpoints', ()=>{
  let app: express.Express

  beforeAll(()=>{
    app = express()
    app.use(express.json())

    // mount handlers
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const checkoutCreate = require('../pages/api/checkout/create').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const piCreate = require('../pages/api/checkout/stripe/create-payment-intent').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sessionCreate = require('../pages/api/checkout/stripe/create-checkout-session').default

    app.post('/api/checkout/create', (req, res) => checkoutCreate(req, res))
    app.post('/api/checkout/stripe/create-payment-intent', (req, res) => piCreate(req, res))
    app.post('/api/checkout/stripe/create-checkout-session', (req, res) => sessionCreate(req, res))
  })

  beforeEach(()=>{
    jest.clearAllMocks()
  })

  test('POST /api/checkout/create creates order and returns order', async ()=>{
    // setup service lookup
    prismaMock.service.findMany.mockResolvedValue([{ id: 'svc1', title: 'Service 1', price: 100 }])
    prismaMock.order.create.mockResolvedValue({ id: 'order_1', userId: 'user_1', items: JSON.stringify([{ serviceId: 'svc1', title: 'Service 1', price: 100, quantity: 1, lineTotal: 100 }]), subtotal: 100, tax: 18, discount: 0, total: 118 })

    const res = await request(app)
      .post('/api/checkout/create')
      .send({ items: [{ serviceId: 'svc1', quantity: 1 }] })
      .expect(201)

    expect(res.body.order).toBeDefined()
    expect(prismaMock.service.findMany).toHaveBeenCalled()
    expect(prismaMock.order.create).toHaveBeenCalled()
  })

  test('POST /api/checkout/stripe/create-payment-intent includes metadata', async ()=>{
    // prepare order
    const order = { id: 'order_2', userId: 'user_1', items: JSON.stringify([{ serviceId: 'svcA', title: 'SvcA', price: 50, quantity:1 }]), total: 59 }
    prismaMock.order.findUnique.mockResolvedValue(order)
    mockPaymentIntentsCreate.mockResolvedValue({ client_secret: 'cs_123' })

    const res = await request(app)
      .post('/api/checkout/stripe/create-payment-intent')
      .send({ orderId: 'order_2' })
      .expect(200)

    expect(res.body.clientSecret).toBe('cs_123')
    expect(mockPaymentIntentsCreate).toHaveBeenCalled()
    const calledWith = mockPaymentIntentsCreate.mock.calls[0][0]
    expect(calledWith).toHaveProperty('metadata')
    expect(calledWith.metadata.orderId).toBe('order_2')
    expect(calledWith.metadata.userId).toBe('user_1')
    expect(calledWith.metadata.serviceId).toContain('svcA')
  })

  test('POST /api/checkout/stripe/create-checkout-session returns session url and includes metadata', async ()=>{
    const order = { id: 'order_3', userId: 'user_1', items: JSON.stringify([{ serviceId: 'svcX', title: 'X', price: 200, quantity:2 }]), total: 472 }
    prismaMock.order.findUnique.mockResolvedValue(order)
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout', id: 'sess_1' })

    const res = await request(app)
      .post('/api/checkout/stripe/create-checkout-session')
      .send({ orderId: 'order_3' })
      .expect(200)

    expect(res.body.url).toBe('https://checkout')
    expect(mockCheckoutCreate).toHaveBeenCalled()
    const args = mockCheckoutCreate.mock.calls[0][0]
    expect(args).toHaveProperty('metadata')
    expect(args.metadata.orderId).toBe('order_3')
  })
})
