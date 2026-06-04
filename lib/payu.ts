// @ts-ignore: node crypto types may be unavailable in this environment
import crypto from 'crypto'

export function generateTxnId(){
  return 'txn_' + Math.random().toString(36).substring(2, 12)
}

export function generatePayuHash({ key, txnid, amount, productinfo, firstname, email, salt }:{ key:string, txnid:string, amount:number|string, productinfo:string, firstname:string, email:string, salt:string }){
  // PayU hash for request: key|txnid|amount|productinfo|firstname|email|||||||||||salt
  const hashString = [key, txnid, String(amount), productinfo, firstname, email, '', '', '', '', '', '', '', '', '', salt].join('|')
  return crypto.createHash('sha512').update(hashString).digest('hex')
}

export function verifyPayuResponseHash(body: any, salt: string, key: string){
  // PayU response hash validation (approx): hash = sha512(salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
  const status = body.status || ''
  const txnid = body.txnid || ''
  const amount = body.amount || ''
  const productinfo = body.productinfo || ''
  const firstname = body.firstname || ''
  const email = body.email || ''

  const hashString = [salt, status, '', '', '', '', '', '', '', '', '', '', email, firstname, productinfo, amount, txnid, key].join('|')
  const expected = crypto.createHash('sha512').update(hashString).digest('hex')
  const received = (body.hash || '').toLowerCase()
  return expected === received
}
