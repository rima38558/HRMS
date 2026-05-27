const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  const services = [
    {
      title: 'Labour Law Consultancy',
      description: 'Expert advice on labour law, compliance and representation in labour departments and courts.',
      price: 5000,
      gstRate: 18,
      checklist: JSON.stringify(['Company PAN', 'Authorization Letter', 'Employee List'])
    },
    {
      title: 'EPF / ESI / PT / LWF Registration (PAN-India)',
      description: 'Assistance with registrations across India for statutory compliance.',
      price: 3000,
      gstRate: 18,
      checklist: JSON.stringify(['Company PAN', 'Address Proof', 'Director IDs'])
    },
    {
      title: 'Payroll Processing (Monthly)',
      description: 'End-to-end payroll processing and statutory filings on behalf of the principal employer.',
      price: 2000,
      gstRate: 18,
      checklist: JSON.stringify(['Attendance', 'Salary Structure', 'Bank Details'])
    }
  ]

  for (const s of services){
    const exists = await prisma.service.findFirst({ where: { title: s.title } })
    if (!exists) {
      await prisma.service.create({ data: s })
    } else {
      await prisma.service.update({ where: { id: exists.id }, data: s })
    }
  }

  console.log('Seeded services')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
