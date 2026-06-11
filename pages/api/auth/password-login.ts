import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import crypto from 'crypto'
import prisma from '../../../lib/prisma'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

  // read local test user store
  const file = '.test_users.json'
  if (!fs.existsSync(file)) return res.status(401).json({ error: 'Invalid credentials' })
  const data = JSON.parse(fs.readFileSync(file,'utf8')||'{}')
  const entry = data[email]
  if (!entry || !entry.passwordHash || !entry.salt) return res.status(401).json({ error: 'Invalid credentials' })

  const derived = crypto.scryptSync(password, entry.salt, 64).toString('hex')
  const ok = derived === entry.passwordHash
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  // ensure user exists in DB and is verified
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user){
    user = await prisma.user.create({ data: { email, name: email.split('@')[0], isVerified: true, role: entry.role || 'user' } })
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  setTokenCookie(res, token)
  return res.status(200).json({ ok: true, user: { id: user.id, email: user.email, role: user.role } })
}
