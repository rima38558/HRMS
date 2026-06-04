import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function Checkout(){
  const router = useRouter()
  const { serviceId } = router.query
  const [loading, setLoading] = useState(false)
  const [formHtml, setFormHtml] = useState<string | null>(null)

  const startPayment = async () =>{
    setLoading(true)
    try{
      const res = await fetch('/api/payments/payu/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      // Build an auto-submitting form
      const inputs = Object.entries(data.params).map(([k,v]) => `<input type='hidden' name='${k}' value='${v}'/>`).join('')
      const html = `<!doctype html><html><body><form id='payuform' method='post' action='${data.action}'>${inputs}</form><script>document.getElementById('payuform').submit()</script></body></html>`
      setFormHtml(html)
    }catch(err: any){
      alert(err.message || 'Error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-xl font-semibold mb-4">Checkout</h1>
      <p className="mb-4">Service: {serviceId}</p>
      <div className="flex gap-2">
        <button onClick={startPayment} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Preparing...' : 'Pay with PayU'}</button>
      </div>
      {formHtml && <div className="mt-4">
        <iframe title="payu" srcDoc={formHtml} style={{ width: '100%', height: 400, border: '1px solid #ddd' }} />
      </div>}
    </div>
  )
}
