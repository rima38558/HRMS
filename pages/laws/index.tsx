import React from 'react'
import prisma from '../../lib/prisma'

export default function Laws({ laws }: any){
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Laws & Notifications</h1>
      {laws.length === 0 && <p className="text-gray-600">No entries available.</p>}
      <ul className="space-y-4">
        {laws.map((l: any) => (
          <li key={l.id} className="p-4 bg-white rounded shadow">
            <h2 className="font-bold">{l.title}</h2>
            <p className="text-sm text-gray-700 mt-1">{l.content?.slice(0, 300)}{l.content && l.content.length > 300 ? '...' : ''}</p>
            <div className="text-xs text-gray-500 mt-2">{l.state ?? 'All states'} — {l.effectiveDate ? new Date(l.effectiveDate).toLocaleDateString() : '—'}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function getServerSideProps(){
  try{
    const laws = await prisma.law.findMany({ orderBy: { effectiveDate: 'desc' } })
    const mapped = laws.map((l:any)=> ({ ...l, effectiveDateFormatted: l.effectiveDate ? new Date(l.effectiveDate).toISOString().slice(0,10) : null }))
    return { props: { laws: JSON.parse(JSON.stringify(mapped)) } }
  }catch(e:any){
    console.error('Error fetching laws', e.message)
    return { props: { laws: [] } }
  }
}
