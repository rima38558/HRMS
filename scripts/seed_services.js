const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const samples = [
    {
      title: 'Payroll setup (one-time)',
      slug: 'payroll-setup',
      description: 'Initial payroll system setup and onboarding',
      price: 499.00,
      isRecurring: false,
      billingInterval: null,
      active: true
    },
    {
      title: 'Monthly payroll processing',
      slug: 'monthly-payroll',
      description: 'Monthly payroll runs for employees',
      price: 99.00,
      isRecurring: true,
      billingInterval: 'MONTHLY',
      active: true
    },
    {
      title: 'Compliance audit (one-time)',
      slug: 'compliance-audit',
      description: 'One-time compliance audit and report',
      price: 299.00,
      isRecurring: false,
      billingInterval: null,
      active: true
    }
  ]

  for (const s of samples){
    const exists = await prisma.service.findUnique({ where: { slug: s.slug } })
    if (!exists){
      await prisma.service.create({ data: s })
      console.log('Created service', s.slug)
    }else{
      console.log('Service exists', s.slug)
    }
  }
}

main()
  .catch(e=>{ console.error(e); process.exit(1) })
  .finally(()=>prisma.$disconnect())
