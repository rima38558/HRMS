import prisma from './prisma'
import { addMinutes } from 'date-fns'

// Generate a 6-digit numeric OTP
export function generateOtpCode(): string{
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create an OTP record for an email, expires in minutes (default 10)
export async function createEmailOtp(email: string, minutes = 10){
  const code = generateOtpCode()
  const expiresAt = addMinutes(new Date(), minutes)
  const otp = await prisma.emailOtp.create({ data: { email, code, expiresAt } })
  return { otp, code }
}

// Verify OTP: returns the EmailOtp record if valid, otherwise null
export async function verifyEmailOtp(email: string, code: string){
  const now = new Date()
  const record = await prisma.emailOtp.findFirst({
    where: { email, code, used: false, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' as const }
  })
  if (!record) return null
  await prisma.emailOtp.update({ where: { id: record.id }, data: { used: true } })
  return record
}

// Simple in-memory rate limiter per key (email or IP) — for production use Redis.
const rateMap = new Map<string, { count: number, windowStart: number }>()
export function checkRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000){
  const now = Date.now()
  const v = rateMap.get(key)
  if (!v || now - v.windowStart > windowMs){
    rateMap.set(key, { count: 1, windowStart: now })
    return { ok: true, remaining: limit - 1 }
  }
  if (v.count >= limit) return { ok: false, remaining: 0 }
  v.count += 1
  rateMap.set(key, v)
  return { ok: true, remaining: limit - v.count }
}

export function resetRateLimit(key: string){
  rateMap.delete(key)
}
