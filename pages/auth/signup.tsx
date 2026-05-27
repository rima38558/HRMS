import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function Signup(){
  const router = useRouter()
  const [form, setForm] = useState({ name: '', organization: '', mobile: '', email: '', street: '', locality: '', state: '', district: '', pincode: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    // basic client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)){
      setMessage('Please enter a valid email')
      setLoading(false)
      return
    }
    if (form.mobile && !/^\d{10,13}$/.test(form.mobile)){
      setMessage('Please enter a valid mobile number (10-13 digits)')
      setLoading(false)
      return
    }

    try{
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessage('OTP sent to your email. Please check and verify.')
      router.push(`/auth/verify?email=${encodeURIComponent(form.email)}`)
    }catch(err: any){
      setMessage(err.message || 'Error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
        {message && <div className="mb-3 text-sm text-blue-700">{message}</div>}
        <form onSubmit={submit} className="space-y-2">
          <input required name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="organization" placeholder="Organization" value={form.organization} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} className="w-full p-2 border rounded" />
          <input required name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" />

          <input name="street" placeholder="Door No / Street" value={form.street} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="locality" placeholder="Locality" value={form.locality} onChange={handleChange} className="w-full p-2 border rounded" />
          <div className="flex gap-2">
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="flex-1 p-2 border rounded" />
            <input name="district" placeholder="District" value={form.district} onChange={handleChange} className="flex-1 p-2 border rounded" />
            <input name="pincode" placeholder="Pin Code" value={form.pincode} onChange={handleChange} className="w-24 p-2 border rounded" />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Sending...' : 'Send OTP'}</button>
            <button type="button" onClick={() => router.push('/')} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
