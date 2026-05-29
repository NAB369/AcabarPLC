import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const nationalId = '123456777';
  const customer = await prisma.customer.findUnique({
    where: { nationalId },
  });

  if (customer) {
    console.log('Found customer with National ID:', customer);
    await prisma.customer.delete({
      where: { nationalId },
    });
    console.log('Customer deleted.');
  } else {
    console.log('No customer found with National ID:', nationalId);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
