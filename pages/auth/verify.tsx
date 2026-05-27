import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Verify(){
  const router = useRouter()
  const { email: qEmail } = router.query
  const [email, setEmail] = useState<string>((qEmail as string) || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => { if (qEmail) setEmail(qEmail as string) }, [qEmail])
  // countdown timer (10 minutes) and resend cooldown (30s)
  const [secondsLeft, setSecondsLeft] = React.useState(10 * 60)
  const [resendCooldown, setResendCooldown] = React.useState(0)

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => setResendCooldown(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  const submit = async (e: React.FormEvent) =>{
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try{
      const res = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setMessage('Verified! Redirecting to dashboard...')
      setTimeout(() => router.push('/dashboard'), 800)
    }catch(err: any){
      setMessage(err.message || 'Error')
    }finally{ setLoading(false) }
  }

  const resend = async () => {
    setLoading(true)
    setMessage(null)
    try{
      const res = await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend')
      setMessage('OTP resent to your email.')
      setResendCooldown(30)
    }catch(err: any){
      setMessage(err.message || 'Error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-lg font-semibold mb-3">Verify Email</h1>
        {message && <div className="mb-3 text-sm text-red-600">{message}</div>}
        <div className="mb-2 text-sm text-gray-600">OTP expires in: {Math.floor(secondsLeft/60)}:{String(secondsLeft%60).padStart(2,'0')}</div>
        <form onSubmit={submit} className="space-y-2">
          <input required name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
          <input required name="code" placeholder="OTP code" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border rounded" />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Verifying...' : 'Verify'}</button>
            <button type="button" onClick={() => router.push('/auth/signup')} className="px-4 py-2 border rounded">Back</button>
            <button type="button" onClick={resend} disabled={resendCooldown>0 || loading} className="px-4 py-2 border rounded">{resendCooldown>0?`Resend (${resendCooldown}s)`: 'Resend OTP'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
