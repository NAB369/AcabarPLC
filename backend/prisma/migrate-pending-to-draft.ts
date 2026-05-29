import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.loan.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'DRAFT' },
  });
  console.log(`✅ Migrated ${result.count} PENDING loans → DRAFT`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
