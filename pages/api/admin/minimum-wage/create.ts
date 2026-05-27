import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { isAdminRequest } from '../../../../lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const ok = await isAdminRequest(req)
  if (!ok) return res.status(403).json({ error: 'Forbidden' })

  const { state, effectiveDate, wageJson } = req.body
  if (!state || !effectiveDate || !wageJson) return res.status(400).json({ error: 'Missing fields' })
  try{
    const mw = await prisma.minimumWage.create({ data: { state, effectiveDate: new Date(effectiveDate), wageJson: JSON.stringify(wageJson) } })
    res.status(200).json({ minimumWage: mw })
  }catch(e:any){
    res.status(500).json({ error: e.message })
  }
}
