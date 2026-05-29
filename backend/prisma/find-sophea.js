const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { firstName: { contains: 'Sophea' } },
        { lastName: { contains: 'Kim' } },
        { khmerName: { contains: 'Sophea' } }
      ]
    },
    include: {
      loans: true
    }
  });
  console.log('Customers found:', JSON.stringify(customers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
