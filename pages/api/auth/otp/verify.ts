import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyEmailOtp } from '../../../../lib/otp'
import prisma from '../../../../lib/prisma'
import { signToken, setTokenCookie } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, code } = req.body || {}
  if (!email || !code) return res.status(400).json({ error: 'email and code required' })

  try{
    const record = await verifyEmailOtp(email, code)
    if (!record) return res.status(400).json({ error: 'invalid or expired code' })

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user){
      user = await prisma.user.create({ data: { email, name: email.split('@')[0], isVerified: true } })
    }else if (!user.isVerified){
      user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } })
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    setTokenCookie(res, token)

    return res.status(200).json({ ok: true, user: { id: user.id, email: user.email, role: user.role } })
  }catch(err:any){
    console.error('OTP verify error', err)
    return res.status(500).json({ error: 'internal' })
  }
}
