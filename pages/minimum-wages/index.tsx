import React from 'react'
import prisma from '../../../lib/prisma'

export default function MinimumWages({ wages }: any){
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Minimum Wages</h1>
      {wages.length === 0 && <p className="text-gray-600">No wage entries available.</p>}
      <div className="space-y-4">
        {wages.map((w: any) => (
          <div key={w.id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between">
              <div>
                <h2 className="font-bold">{w.state}</h2>
                <div className="text-sm text-gray-600">Effective: {new Date(w.effectiveDate).toLocaleDateString()}</div>
              </div>
            </div>
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(w.wageJson, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function getServerSideProps(){
  try{
    const wages = await prisma.minimumWage.findMany({ orderBy: { effectiveDate: 'desc' } })
    const mapped = wages.map((w:any)=> ({ ...w, effectiveDateFormatted: w.effectiveDate ? new Date(w.effectiveDate).toISOString().slice(0,10) : null }))
    return { props: { wages: JSON.parse(JSON.stringify(mapped)) } }
  }catch(e:any){
    console.error('Error fetching minimum wages', e.message)
    return { props: { wages: [] } }
  }
}
