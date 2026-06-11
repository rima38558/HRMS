import React from 'react'

type Service = {
  id: string
  title: string
  description: string
  price: number
  gstRate?: number
  isRecurring?: boolean
  discountPercent?: number
}

export default function ServiceCard({ service, onAdd }: { service: Service, onAdd?: (s: Service)=>void }){
  const priceWithGst = service.price + (service.gstRate? service.price * service.gstRate/100 : 0)
  const discounted = service.discountPercent ? priceWithGst * (1 - service.discountPercent/100) : priceWithGst
  return (
    <div className="border rounded p-4 shadow-sm">
      <h3 className="font-semibold text-lg">{service.title}</h3>
      <p className="text-sm text-gray-600 my-2">{service.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="text-sm text-gray-500">Price</div>
          <div className="font-medium">₹{discounted.toFixed(2)} {service.isRecurring ? <span className="text-xs text-gray-500">/month</span> : null}</div>
        </div>
        <button onClick={()=>onAdd?.(service)} className="px-3 py-2 bg-blue-600 text-white rounded">Add to cart</button>
      </div>
    </div>
  )
}
