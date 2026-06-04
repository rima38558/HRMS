import React, { useState } from 'react'
import prisma from '../../lib/prisma'
import { GetServerSideProps } from 'next'
import { getUserFromRequest } from '../../lib/auth'

export default function AdminWages({ wages }: any){
  const [form, setForm] = useState({ state: '', effectiveDate: '', wageJson: '{}' })

  const create = async (e:any) =>{
    e.preventDefault()
    let parsed
    try{ parsed = JSON.parse(form.wageJson) }catch(e){ alert('Invalid JSON for wage data'); return }
    const res = await fetch('/api/admin/minimum-wage/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: form.state, effectiveDate: form.effectiveDate, wageJson: parsed }) })
    const j = await res.json()
    if (!res.ok) alert(j.error || 'Failed')
    else location.reload()
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Admin — Minimum Wages</h1>
      <form onSubmit={create} className="mb-6 space-y-2">
        <input placeholder="State" value={form.state} onChange={e=>setForm({...form, state: e.target.value})} className="p-2 border rounded w-full" />
        <input type="date" value={form.effectiveDate} onChange={e=>setForm({...form, effectiveDate: e.target.value})} className="p-2 border rounded w-full" />
        <textarea placeholder="Wage JSON" value={form.wageJson} onChange={e=>setForm({...form, wageJson: e.target.value})} className="p-2 border rounded w-full" />
        <button className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
      </form>

      <h2 className="font-semibold mb-2">Existing Entries</h2>
      <ul className="list-disc ml-6">
        {wages.map((w:any)=>(<li key={w.id}>{w.state} — {w.effectiveDateFormatted || new Date(w.effectiveDate).toISOString().slice(0,10)}</li>))}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) =>{
  const decoded: any = getUserFromRequest(context.req as any)
  if (!decoded || !decoded.userId) return { redirect: { destination: '/auth/signup', permanent: false } }
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((s: string) => s.trim()) : []
  if (!user || (user.role !== 'admin' && !adminEmails.includes(user.email))) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const wages = await prisma.minimumWage.findMany({ orderBy: { effectiveDate: 'desc' } })
  const mapped = wages.map((w:any)=> ({ ...w, effectiveDateFormatted: w.effectiveDate ? new Date(w.effectiveDate).toISOString().slice(0,10) : null }))
  return { props: { wages: JSON.parse(JSON.stringify(mapped)) } }
}
