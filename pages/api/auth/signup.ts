import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { sendOtpEmail } from '../../../lib/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'})
  const { name, organization, mobile, email, street, locality, state, district, pincode } = req.body
  if (!email || !name) return res.status(400).json({error: 'Missing required fields'})

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user){
    user = await prisma.user.create({ data: { name, organization, mobile, email, street, locality, state, district, pincode } })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000)
  await prisma.emailOtp.create({ data: { email, code, expiresAt: expires, userId: user.id } })

  await sendOtpEmail(email, code)

  res.status(200).json({ message: 'OTP sent to email' })
}
