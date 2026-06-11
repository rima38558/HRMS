import Head from 'next/head'
import { useEffect, useState } from 'react'

export default function Profile(){
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    // fetch user from /api/auth/me or decode cookie
    fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d?.user || null)).catch(()=>{})
  },[])

  return (
    <div className="p-6">
      <Head><title>Profile - Dashboard</title></Head>
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>
      {!user && <div>Loading...</div>}
      {user && (
        <div className="max-w-xl">
          <div><strong>Name:</strong> {user.name || '—'}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div className="mt-4">
            <h3 className="font-semibold">Billing Info</h3>
            <pre className="text-sm bg-gray-50 p-3 rounded">{JSON.stringify(user.billingInfo || {}, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
