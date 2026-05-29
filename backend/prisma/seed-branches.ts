import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding branches...');
  
  const branches = [
    { name: 'Headquarters', code: 'HQ', address: 'Phnom Penh, Cambodia' },
    { name: 'Siem Reap Branch', code: 'SRB', address: 'Siem Reap, Cambodia' },
    { name: 'Battambang Branch', code: 'BTB', address: 'Battambang, Cambodia' },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: {},
      create: branch,
    });
  }

  console.log('Branches seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
