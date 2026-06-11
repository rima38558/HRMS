import type { NextApiRequest, NextApiResponse } from 'next'
import { createEmailOtp, checkRateLimit } from '../../../../lib/otp'
import { sendOtpEmail } from '../../../../lib/mail'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email required' })

  // rate-limit by email
  const rl = checkRateLimit(`otp:${email}`)
  if (!rl.ok) return res.status(429).json({ error: 'too many requests' })

  try{
    const { code } = await createEmailOtp(email)
    await sendOtpEmail(email, code)
    return res.status(200).json({ ok: true })
  }catch(err:any){
    console.error('OTP request error', err)
    return res.status(500).json({ error: 'internal' })
  }
}
