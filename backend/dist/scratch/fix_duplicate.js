"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const phone = '+85510932080';
    const customer = await prisma.customer.findUnique({
        where: { phone },
    });
    if (customer) {
        console.log('Found customer:', customer);
        await prisma.customer.delete({
            where: { phone },
        });
        console.log('Customer deleted.');
    }
    else {
        console.log('Customer not found.');
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=fix_duplicate.js.map