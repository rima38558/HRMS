import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { sendOtpEmail } from '../../../lib/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Missing email' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000)
  await prisma.emailOtp.create({ data: { email, code, expiresAt: expires, userId: user.id } })
  await sendOtpEmail(email, code)

  res.status(200).json({ message: 'OTP resent' })
}
