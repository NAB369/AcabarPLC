const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const nulls = await prisma.ledgerEntry.findMany({
    where: { accountCode: null }
  });
  console.log('Nulls found:', nulls.length);
  if (nulls.length > 0) {
    console.log(nulls.map(n => n.accountId + ' | ' + n.accountType).join('\n'));
  }
}
run().catch(console.error);
