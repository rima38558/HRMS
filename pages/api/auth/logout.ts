import type { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse){
  res.setHeader('Set-Cookie', cookie.serialize('token', '', { path: '/', maxAge: 0 }))
  res.status(200).json({ message: 'Logged out' })
}
