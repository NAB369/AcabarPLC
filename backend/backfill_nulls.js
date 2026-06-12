const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.ledgerEntry.updateMany({
    where: { accountId: 'CASH-VAULT', accountCode: null },
    data: { accountCode: '10100' }
  });
  await prisma.ledgerEntry.updateMany({
    where: { accountType: 'LOAN', accountCode: null },
    data: { accountCode: '12100' }
  });
  await prisma.ledgerEntry.updateMany({
    where: { accountId: 'INTEREST-INCOME', accountCode: null },
    data: { accountCode: '40100' }
  });
  await prisma.ledgerEntry.updateMany({
    where: { accountId: 'PENALTY-INCOME', accountCode: null },
    data: { accountCode: '40200' }
  });
  
  const nulls = await prisma.ledgerEntry.findMany({
    where: { accountCode: null }
  });
  console.log('Nulls remaining after backfill:', nulls.length);
}
run().catch(console.error);
