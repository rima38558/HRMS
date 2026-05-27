import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { isAdminRequest } from '../../../../lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const ok = await isAdminRequest(req)
  if (!ok) return res.status(403).json({ error: 'Forbidden' })

  const { title, content, state, effectiveDate, tags } = req.body
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' })
  try{
    const law = await prisma.law.create({ data: { title, content, state: state || null, effectiveDate: effectiveDate ? new Date(effectiveDate) : null, tags: tags ? JSON.parse(JSON.stringify(tags)) : null } })
    res.status(200).json({ law })
  }catch(e:any){
    res.status(500).json({ error: e.message })
  }
}
