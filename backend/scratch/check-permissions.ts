import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });
  console.log("ROLES & PERMISSIONS:");
  for (const role of roles) {
    console.log(`Role: ${role.name}`);
    console.log("Permissions:", role.permissions.map(p => p.permission.name));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
