import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { signToken, setTokenCookie } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, code } = req.body
  if (!email || !code) return res.status(400).json({ error: 'Missing email or code' })

  const otp = await prisma.emailOtp.findFirst({ where: { email, code, used: false }, orderBy: { expiresAt: 'desc' } })
  if (!otp) return res.status(400).json({ error: 'Invalid code' })
  if (otp.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired' })

  // mark used
  await prisma.emailOtp.update({ where: { id: otp.id }, data: { used: true } })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(500).json({ error: 'User not found' })

  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } })

  const token = signToken({ userId: user.id, email: user.email })
  setTokenCookie(res, token)

  res.status(200).json({ message: 'Verified', user: { id: user.id, email: user.email, name: user.name } })
}
