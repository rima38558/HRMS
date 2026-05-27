import React, { useState } from 'react'
import prisma from '../../lib/prisma'
import { GetServerSideProps } from 'next'
import { getUserFromRequest } from '../../lib/auth'

export default function AdminLaws({ laws }: any){
  const [form, setForm] = useState({ title: '', content: '', state: '', effectiveDate: '' })

  const create = async (e:any) =>{
    e.preventDefault()
    const res = await fetch('/api/admin/law/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const j = await res.json()
    if (!res.ok) alert(j.error || 'Failed')
    else location.reload()
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Admin — Laws & Notifications</h1>
      <form onSubmit={create} className="mb-6 space-y-2">
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="p-2 border rounded w-full" />
        <textarea placeholder="Content" value={form.content} onChange={e=>setForm({...form, content: e.target.value})} className="p-2 border rounded w-full" />
        <div className="flex gap-2">
          <input placeholder="State (optional)" value={form.state} onChange={e=>setForm({...form, state: e.target.value})} className="p-2 border rounded" />
          <input type="date" placeholder="Effective" value={form.effectiveDate} onChange={e=>setForm({...form, effectiveDate: e.target.value})} className="p-2 border rounded" />
        </div>
        <button className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
      </form>

      <h2 className="font-semibold mb-2">Existing Entries</h2>
      <ul className="list-disc ml-6">
        {laws.map((l:any)=>(<li key={l.id}>{l.title} — {l.state || 'All'} — {l.effectiveDateFormatted || '—'}</li>))}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) =>{
  const decoded: any = getUserFromRequest(context.req as any)
  if (!decoded || !decoded.userId) return { redirect: { destination: '/auth/signup', permanent: false } }
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(s=>s.trim()) : []
  if (!user || (user.role !== 'admin' && !adminEmails.includes(user.email))) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const laws = await prisma.law.findMany({ orderBy: { effectiveDate: 'desc' } })
  const mapped = laws.map((l:any)=> ({ ...l, effectiveDateFormatted: l.effectiveDate ? new Date(l.effectiveDate).toISOString().slice(0,10) : null }))
  return { props: { laws: JSON.parse(JSON.stringify(mapped)) } }
}
