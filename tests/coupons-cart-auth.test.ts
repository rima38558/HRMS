import request from 'supertest'
import express from 'express'
import crypto from 'crypto'

// Mock prisma used by handlers
const prismaMock: any = {
  coupon: { findUnique: jest.fn() },
  cart: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  user: { findUnique: jest.fn(), create: jest.fn() },
}
jest.mock('../lib/prisma', () => ({ default: prismaMock }))

// Mock auth to return a test user for cart endpoints
jest.mock('../lib/auth', () => ({ getUserFromRequest: () => ({ userId: 'user_42', email: 'test@example.com', role: 'USER', name: 'Test' }), signToken: () => 'tok', setTokenCookie: (_res:any,_t:any)=>{} }))

// Mock fs for password-login
jest.mock('fs', () => ({ existsSync: jest.fn(), readFileSync: jest.fn() }))
const fs = require('fs')

describe('Coupons, Cart, and Auth endpoints', ()=>{
  let app: express.Express

  beforeAll(()=>{
    app = express()
    app.use(express.json())

    // mount handlers
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const coupons = require('../pages/api/coupons/validate').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cartIndex = require('../pages/api/cart/index').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cartAdd = require('../pages/api/cart/add').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pwLogin = require('../pages/api/auth/password-login').default

    app.post('/api/coupons/validate', (req,res)=>coupons(req,res))
    app.get('/api/cart', (req,res)=>cartIndex(req,res))
    app.put('/api/cart', (req,res)=>cartIndex(req,res))
    app.post('/api/cart/add', (req,res)=>cartAdd(req,res))
    app.post('/api/auth/password-login', (req,res)=>pwLogin(req,res))
  })

  beforeEach(()=>{
    jest.clearAllMocks()
    // default fs mock behavior
    fs.existsSync.mockReturnValue(false)
    fs.readFileSync.mockReturnValue('{}')
  })

  test('POST /api/coupons/validate returns discount for fixed amount coupon', async ()=>{
    prismaMock.coupon.findUnique.mockResolvedValue({ code: 'OFF50', amount: 50, active: true })

    const res = await request(app).post('/api/coupons/validate').send({ code: 'OFF50', subtotal: 200 }).expect(200)
    expect(res.body.valid).toBeTruthy()
    expect(res.body.discount).toBe(50)
  })

  test('POST /api/coupons/validate computes percent discount', async ()=>{
    prismaMock.coupon.findUnique.mockResolvedValue({ code: 'P10', percent: 10, active: true })
    const res = await request(app).post('/api/coupons/validate').send({ code: 'P10', subtotal: 300 }).expect(200)
    expect(res.body.discount).toBeCloseTo(30)
  })

  test('Cart add creates cart when none exists', async ()=>{
    prismaMock.cart.findUnique.mockResolvedValue(null)
    prismaMock.cart.create.mockResolvedValue({ id: 'cart_1', userId: 'user_42', items: [{ serviceId: 'svc1', quantity: 1 }] })

    const res = await request(app).post('/api/cart/add').send({ serviceId: 'svc1', quantity: 1 }).expect(201)
    expect(res.body.cart).toBeDefined()
    expect(prismaMock.cart.create).toHaveBeenCalled()
  })

  test('Cart add updates existing cart', async ()=>{
    prismaMock.cart.findUnique.mockResolvedValue({ id: 'cart_2', userId: 'user_42', items: [{ serviceId: 'svc1', quantity: 1 }] })
    prismaMock.cart.update.mockResolvedValue({ id: 'cart_2', userId: 'user_42', items: [{ serviceId: 'svc1', quantity: 2 }] })

    const res = await request(app).post('/api/cart/add').send({ serviceId: 'svc1', quantity: 1 }).expect(200)
    expect(res.body.cart).toBeDefined()
    expect(prismaMock.cart.update).toHaveBeenCalled()
  })

  test('GET /api/cart returns null when no cart', async ()=>{
    prismaMock.cart.findUnique.mockResolvedValue(null)
    const res = await request(app).get('/api/cart').expect(200)
    expect(res.body.cart).toBeNull()
  })

  test('Password login validates local .test_users.json and creates user', async ()=>{
    // create salt and passwordHash matching 'Secret123!'
    const salt = crypto.randomBytes(8).toString('hex')
    const password = 'Secret123!'
    const hash = crypto.scryptSync(password, salt, 64).toString('hex')
    const users = { 'alice@example.com': { passwordHash: hash, salt, role: 'USER' } }
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(JSON.stringify(users))

    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({ id: 'user_new', email: 'alice@example.com', role: 'USER' })

    const res = await request(app).post('/api/auth/password-login').send({ email: 'alice@example.com', password }).expect(200)
    expect(res.body.ok).toBeTruthy()
    expect(prismaMock.user.create).toHaveBeenCalled()
  })
})
