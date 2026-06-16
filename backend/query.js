const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Sokha' } },
        { lastName: { contains: 'Chan' } },
      ],
    },
    include: {
      loans: {
        include: {
          repaymentSchedules: true,
          payments: true,
        }
      }
    }
  });
  console.dir(customer, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
