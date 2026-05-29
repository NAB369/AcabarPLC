"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=migrate-pending-to-draft.js.map