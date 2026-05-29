"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const products = [
        {
            name: 'Home Loan',
            description: 'Loans for buying or renovating houses. (ឥណទានផ្ទះ)',
            minAmount: 10000,
            maxAmount: 500000,
            baseInterestRate: 7.0,
            interestType: 'REDUCING',
        },
        {
            name: 'Auto Loan',
            description: 'Loans for buying cars or other vehicles. (ឥណទានយានយន្ត)',
            minAmount: 5000,
            maxAmount: 100000,
            baseInterestRate: 9.0,
            interestType: 'REDUCING',
        },
        {
            name: 'Business Loan',
            description: 'Loans for business expansion or working capital. (ឥណទានអាជីវកម្ម)',
            minAmount: 5000,
            maxAmount: 250000,
            baseInterestRate: 12.0,
            interestType: 'REDUCING',
        },
        {
            name: 'Personal Loan',
            description: 'Loans for personal needs or emergencies. (ឥណទានបុគ្គល)',
            minAmount: 500,
            maxAmount: 20000,
            baseInterestRate: 15.0,
            interestType: 'FLAT',
        },
        {
            name: 'Education Loan',
            description: 'Loans for higher education or vocational training. (ឥណទានអប់រំ)',
            minAmount: 1000,
            maxAmount: 50000,
            baseInterestRate: 6.0,
            interestType: 'REDUCING',
        },
        {
            name: 'Agriculture Loan',
            description: 'Loans for farming, machinery, or livestock. (ឥណទានកសិកម្ម)',
            minAmount: 1000,
            maxAmount: 100000,
            baseInterestRate: 10.0,
            interestType: 'REDUCING',
        },
        {
            name: 'Construction Loan',
            description: 'Loans for building or constructing properties. (ឥណទានសំណង់)',
            minAmount: 20000,
            maxAmount: 1000000,
            baseInterestRate: 8.0,
            interestType: 'REDUCING',
        },
        {
            name: 'Digital / Instant Loan',
            description: 'Fast, automated digital loans via app. (ឥណទានឌីជីថល/ភ្លាមៗ)',
            minAmount: 100,
            maxAmount: 5000,
            baseInterestRate: 18.0,
            interestType: 'FLAT',
        },
    ];
    console.log('Seeding loan products...');
    for (const product of products) {
        await prisma.loanProduct.upsert({
            where: { name: product.name },
            update: product,
            create: product,
        });
    }
    console.log('Loan products seeded successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-products.js.map