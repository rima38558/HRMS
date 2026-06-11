import jwt from 'jsonwebtoken'
import { NextApiResponse } from 'next'
import cookie from 'cookie'

// Ensure `process` is available to the TypeScript checker in some environments
declare const process: any

export function signToken(payload: object){
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set')
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string){
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set')
  return jwt.verify(token, process.env.JWT_SECRET)
}

export function setTokenCookie(res: NextApiResponse, token: string){
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', cookie.serialize('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  }))
}

// Read token from incoming request (server-side)
export function getUserFromRequest(req: any){
  try{
    const raw = req.headers?.cookie || req?.cookies || ''
    const cookies = typeof raw === 'string' ? cookie.parse(raw || '') : raw
    const token = cookies?.token
    if (!token) return null
    const decoded = verifyToken(token) as any
    // Normalize token payload to include userId for older tokens that used `id`
    if (decoded && !decoded.userId && decoded.id) decoded.userId = decoded.id
    return decoded
  }catch(e){
    return null
  }
}
