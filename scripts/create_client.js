const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const prisma = new PrismaClient()
const fs = require('fs')
const crypto = require('crypto')

async function main(){
  const email = process.env.CLIENT_SEED_EMAIL || 'client@example.com'
  const name = process.env.CLIENT_SEED_NAME || 'Test Client'
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not set in environment (.env). Aborting.')
    process.exit(1)
  }

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user){
    user = await prisma.user.create({ data: { name, email, isVerified: true, role: 'user' } })
    console.log('Created client user:', email)
  } else {
    user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, role: 'user', name } })
    console.log('Updated existing user to client:', email)
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  try{ fs.writeFileSync('.client_token', token) }catch(e){}
  console.log('\n=== Client Token (copy and set cookie named `token`) ===')
  console.log(token)
  console.log('===============================================\n')
  console.log('To use this token in the browser:')
  console.log("1. Open DevTools → Application → Cookies for http://localhost:3000")
  console.log("2. Add cookie named 'token' with the above value and path '/'")
  console.log("3. Refresh the client page (e.g., /orders or /services).")
  if (process.env.CLIENT_PASSWORD){
    try{
      const salt = crypto.randomBytes(16).toString('hex')
      const derived = crypto.scryptSync(process.env.CLIENT_PASSWORD, salt, 64).toString('hex')
      const tdata = fs.existsSync('.test_users.json') ? JSON.parse(fs.readFileSync('.test_users.json','utf8')||'{}') : {}
      tdata[email] = { passwordHash: derived, salt, role: 'user' }
      fs.writeFileSync('.test_users.json', JSON.stringify(tdata, null, 2))
      console.log('Wrote client password hash to .test_users.json')
    }catch(e){ console.warn('Failed to write test credentials:', e.message||e) }
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
