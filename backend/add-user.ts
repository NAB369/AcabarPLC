import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'henghab@gmail.com';
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      passwordHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      isActive: true
    },
    create: {
      email,
      passwordHash,
      firstName: 'Heng',
      lastName: 'Hab',
      branchId: (await prisma.branch.findFirst())?.id,
    }
  });

  const role = await prisma.role.findUnique({ where: { name: 'CREDIT_OFFICER' } });
  if (role) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id }
    });
  }
  console.log(`User ${email} has been reset to password123 and CREDIT_OFFICER role.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
