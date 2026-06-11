import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

type Cart = { items: Array<{ serviceId: string, quantity: number }> }
type Service = { id: string, title: string, description?: string, price: number }

export default function CheckoutPage(){
  const [cart, setCart] = useState<Cart | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState<number|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const stripeRef = useRef<any>(null)
  const cardRef = useRef<any>(null)
  const [cardMounted, setCardMounted] = useState(false)

  useEffect(()=>{
    Promise.all([
      fetch('/api/cart').then(r=>r.json()),
      fetch('/api/services').then(r=>r.json()),
    ]).then(([cartRes, servicesRes])=>{
      setCart(cartRes.cart)
      setServices(servicesRes.services || [])
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  // load Stripe.js and mount card element if stripeKey present
  useEffect(()=>{
    if (!stripeKey) return
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]')
    if (!existing){
      const s = document.createElement('script')
      s.src = 'https://js.stripe.com/v3/'
      s.async = true
      s.onload = () => {
        const stripe = (window as any).Stripe(stripeKey)
        stripeRef.current = stripe
        const elements = stripe.elements()
        const card = elements.create('card')
        card.mount('#card-element')
        cardRef.current = card
        setCardMounted(true)
      }
      document.body.appendChild(s)
    }else{
      const stripe = (window as any).Stripe(stripeKey)
      stripeRef.current = stripe
      const elements = stripe.elements()
      const card = elements.create('card')
      card.mount('#card-element')
      cardRef.current = card
      setCardMounted(true)
    }
    return ()=>{
      try{ if (cardRef.current) cardRef.current.destroy() }catch(e){}
    }
  },[stripeKey])

  if (loading) return <div className="p-6">Loading…</div>
  if (!cart || !cart.items || cart.items.length === 0) return <div className="p-6">Your cart is empty.</div>

  const lineItems = cart.items.map(it=>{
    const svc = services.find(s=>String(s.id) === String(it.serviceId))
    return { ...it, title: svc?.title || 'Service', price: svc?.price || 0, lineTotal: (svc?.price || 0) * (it.quantity || 1) }
  })

  const subtotal = lineItems.reduce((s, it)=> s + it.lineTotal, 0)
  const tax = +(subtotal * 0.18).toFixed(2)
  const total = +(subtotal + tax - (discount || 0)).toFixed(2)

  async function checkCoupon(){
    if (!coupon) return
    const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: coupon, subtotal }) })
    const data = await res.json()
    if (data.valid) setDiscount(Number(data.discount || 0))
    else { setDiscount(0); alert(data.reason || 'Invalid coupon') }
  }

  async function submitCheckout(){
    setSubmitting(true)
    try{
      const res = await fetch('/api/checkout/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items, couponCode: coupon }) })
      const data = await res.json()
      if (!data || !data.order) return alert('Failed to create order')

      // If PayU params returned, auto-submit form to PayU gateway
      if (data.payu){
        const payu = data.payu
        const form = document.createElement('form')
        form.method = 'POST'
        const PAYU_URL = (process.env.NEXT_PUBLIC_PAYU_URL) || 'https://sandboxsecure.payu.in/_payment'
        form.action = PAYU_URL
        form.style.display = 'none'
        const fields: Record<string,string|number> = {
          key: payu.key,
          txnid: payu.txnid,
          amount: payu.amount,
          productinfo: payu.productinfo,
          firstname: payu.firstname,
          email: payu.email,
          hash: payu.hash,
          service_provider: 'payu_paisa',
          surl: `${window.location.origin}/order/${data.order.id}?status=success`,
          furl: `${window.location.origin}/order/${data.order.id}?status=failed`,
        }
        for (const k of Object.keys(fields)){
          const inp = document.createElement('input')
          inp.type = 'hidden'
          inp.name = k
          inp.value = String((fields as any)[k])
          form.appendChild(inp)
        }
        document.body.appendChild(form)
        form.submit()
        return
      }

      // If Stripe publishable key available, create PaymentIntent and confirm via Stripe.js
      if (stripeKey){
        // Create PaymentIntent on server
        const intentRes = await fetch('/api/checkout/stripe/create-payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: data.order.id }) })
        const intentData = await intentRes.json()
        const clientSecret = intentData?.clientSecret
        if (!clientSecret) return alert('Failed to create payment intent')
        const stripe = (window as any).Stripe(stripeKey)
        if (!stripe) return alert('Stripe.js not loaded')
        const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardRef.current, billing_details: { name: 'Customer', email: '' } } })
        if (result.error) {
          alert(result.error.message || 'Payment failed')
          return
        }
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded'){
          router.push(`/order/${data.order.id}`)
          return
        }
      }

      // fallback: navigate to order confirmation
      router.push(`/order/${data.order.id}`)
    }finally{
      setSubmitting(false)
    }
  }

  // Create an order then start Stripe Checkout Session (server-created session)
  async function payWithStripeCheckout(){
    setSubmitting(true)
    try{
      const createRes = await fetch('/api/checkout/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items, couponCode: coupon }) })
      const createData = await createRes.json()
      if (!createData || !createData.order) return alert('Failed to create order')

      const orderId = createData.order.id
      const sessionRes = await fetch('/api/checkout/stripe/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) })
      const sessionData = await sessionRes.json()
      if (sessionData && sessionData.url){
        window.location.href = sessionData.url
        return
      }
      alert('Failed to create Stripe checkout session')
    }catch(e:any){
      console.error(e)
      alert('Payment failed')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Head><title>Checkout</title></Head>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="space-y-4">
        {lineItems.map((it, idx)=> (
          <div key={idx} className="flex justify-between border-b py-2">
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
            </div>
            <div>₹{it.lineTotal.toFixed(2)}</div>
          </div>
        ))}

        <div className="pt-4">
          <div className="flex items-center gap-2">
            <input className="border p-2" value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Coupon code" />
            <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={checkCoupon}>Apply</button>
            {discount !== null && <div className="text-green-600">Discount: ₹{discount}</div>}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between py-1"><div>Subtotal</div><div>₹{subtotal.toFixed(2)}</div></div>
          <div className="flex justify-between py-1"><div>Tax (18%)</div><div>₹{tax.toFixed(2)}</div></div>
          <div className="flex justify-between font-semibold py-1"><div>Total</div><div>₹{total.toFixed(2)}</div></div>
        </div>

        <div className="pt-4">
            {stripeKey && <div className="mb-2">
              <div id="card-element" className="p-2 border rounded"></div>
            </div>}
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submitCheckout} disabled={submitting || (stripeKey && !cardMounted)}>{submitting ? 'Processing…' : 'Place Order'}</button>
        </div>
      </div>
    </div>
  )
}
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
