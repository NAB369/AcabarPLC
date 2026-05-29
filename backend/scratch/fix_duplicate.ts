import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '+85510932080';
  const customer = await prisma.customer.findUnique({
    where: { phone },
  });

  if (customer) {
    console.log('Found customer:', customer);
    // Delete them so the user can re-register
    await prisma.customer.delete({
      where: { phone },
    });
    console.log('Customer deleted.');
  } else {
    console.log('Customer not found.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
