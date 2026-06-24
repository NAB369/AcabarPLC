const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const loans = await prisma.loan.findMany({
    where: { excludeWeekends: true },
    include: { repaymentSchedules: true }
  });
  
  let issues = 0;
  for (const l of loans) {
    for (const s of l.repaymentSchedules) {
      const d = new Date(s.dueDate);
      if (d.getDay() === 0 || d.getDay() === 6) {
        console.log('Loan ID:', l.id, 'Schedule:', s.installmentNumber, 'Date:', d.toISOString(), 'Day:', d.getDay());
        issues++;
      }
    }
  }
  console.log('Total issues:', issues);
}
main().catch(console.error).finally(() => prisma.$disconnect());
