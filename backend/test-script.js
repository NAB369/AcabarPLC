const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const loan = await prisma.loan.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, excludeWeekends: true, repaymentSchedules: { select: { dueDate: true, installmentNumber: true } } }
  });
  console.log(JSON.stringify(loan, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
