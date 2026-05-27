import { NextApiRequest } from 'next'
import { getUserFromRequest } from './auth'
import prisma from './prisma'

export async function isAdminRequest(req: NextApiRequest){
  const decoded: any = getUserFromRequest(req as any)
  if (!decoded || !decoded.userId) return false
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  if (!user) return false
  if (user.role === 'admin') return true
  // allow override via env ADMIN_EMAILS (comma-separated)
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s=>s.trim()) : []
  if (adminEmails.includes(user.email)) return true
  return false
}
