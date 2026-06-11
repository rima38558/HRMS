import React, { useEffect, useState } from 'react'
import Head from 'next/head'

export default function CartPage(){
  const [cart, setCart] = useState<any>(null)

  useEffect(()=>{
    fetch('/api/cart', { credentials: 'same-origin' })
      .then(r=>r.json())
      .then(d=>setCart(d.cart))
      .catch(()=>setCart(null))
  },[])

  if (!cart) return (<div className="p-6"><Head><title>Cart</title></Head><h1 className="text-xl">Cart</h1><p>Your cart is empty.</p></div>)

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Head><title>Cart</title></Head>
      <h1 className="text-2xl font-bold mb-4">Your cart</h1>
      <ul>
        {cart.items?.map((it:any, idx:number)=> (
          <li key={idx} className="border-b py-2">Service: {it.serviceId} × {it.quantity}</li>
        ))}
      </ul>
      <div className="mt-4">
        <a className="bg-green-600 text-white px-4 py-2 rounded" href="/checkout">Proceed to checkout</a>
      </div>
    </div>
  )
}
