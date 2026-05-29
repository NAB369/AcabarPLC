import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing operational and customer data from database...');

  // Delete dependent tables first to avoid foreign key constraint violations
  const repaymentSchedules = await prisma.repaymentSchedule.deleteMany();
  console.log(`- Cleared ${repaymentSchedules.count} repayment schedules`);

  const ledgerEntries = await prisma.ledgerEntry.deleteMany();
  console.log(`- Cleared ${ledgerEntries.count} ledger entries`);

  const auditLogs = await prisma.auditLog.deleteMany();
  console.log(`- Cleared ${auditLogs.count} audit logs`);

  const feedback = await prisma.feedback.deleteMany();
  console.log(`- Cleared ${feedback.count} feedback records`);

  const consultations = await prisma.consultation.deleteMany();
  console.log(`- Cleared ${consultations.count} consultations`);

  const guarantors = await prisma.guarantor.deleteMany();
  console.log(`- Cleared ${guarantors.count} guarantors`);

  const collaterals = await prisma.collateral.deleteMany();
  console.log(`- Cleared ${collaterals.count} collaterals`);

  const approvalSteps = await prisma.approvalStep.deleteMany();
  console.log(`- Cleared ${approvalSteps.count} approval steps`);

  const creditReports = await prisma.creditReport.deleteMany();
  console.log(`- Cleared ${creditReports.count} credit reports`);

  const documents = await prisma.document.deleteMany();
  console.log(`- Cleared ${documents.count} customer documents`);

  const loans = await prisma.loan.deleteMany();
  console.log(`- Cleared ${loans.count} loans`);

  const customers = await prisma.customer.deleteMany();
  console.log(`- Cleared ${customers.count} customers`);

  console.log('✅ Database data cleared successfully (users, roles, branches, and products retained).');
}

main()
  .catch((e) => {
    console.error('Error clearing database data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
