import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const res = await fetch('/api/auth/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Login failed')
        setLoading(false)
        return
      }
      // on success the server sets the auth cookie; redirect to dashboard
      router.push('/dashboard')
    }catch(err:any){
      setError(err?.message || 'Network error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Head>
        <title>Login - Legal Compliance</title>
      </Head>
      <main className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" />
          <input name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="border p-2 rounded" />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
        <p className="mt-4 text-sm">Do not have an account? <Link href="/auth/signup" className="text-blue-600">Register</Link></p>
      </main>
    </div>
  )
}
