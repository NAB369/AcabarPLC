"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Fixing granular roles for CASHIER, TELLER, and ACCOUNTANT...');
    const cashierRole = await prisma.role.upsert({
        where: { name: 'CASHIER' },
        update: {},
        create: { name: 'CASHIER', description: 'Cash operations' },
    });
    const tellerRole = await prisma.role.findUnique({ where: { name: 'TELLER' } });
    const accountantRole = await prisma.role.findUnique({ where: { name: 'ACCOUNTANT' } });
    const requiredTellerPerms = ['VIEW_DASHBOARD', 'MANAGE_DISBURSEMENT', 'MANAGE_CUSTOMERS'];
    const requiredAccountantPerms = ['VIEW_DASHBOARD', 'VIEW_PERIOD', 'MANAGE_PERIOD', 'VIEW_REPORTS', 'MANAGE_ACCOUNTS', 'MANAGE_JOURNAL', 'VIEW_ACCOUNTS'];
    const allRequiredPerms = [...new Set([...requiredTellerPerms, ...requiredAccountantPerms])];
    const permMap = {};
    for (const p of allRequiredPerms) {
        const perm = await prisma.permission.upsert({
            where: { name: p },
            update: {},
            create: { name: p, description: `Auto-generated permission: ${p}` },
        });
        permMap[p] = perm.id;
    }
    for (const permName of requiredTellerPerms) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: cashierRole.id, permissionId: permMap[permName] } },
            update: {},
            create: { roleId: cashierRole.id, permissionId: permMap[permName] }
        });
        if (tellerRole) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: tellerRole.id, permissionId: permMap[permName] } },
                update: {},
                create: { roleId: tellerRole.id, permissionId: permMap[permName] }
            });
        }
    }
    if (accountantRole) {
        for (const permName of requiredAccountantPerms) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: accountantRole.id, permissionId: permMap[permName] } },
                update: {},
                create: { roleId: accountantRole.id, permissionId: permMap[permName] }
            });
        }
    }
    console.log('Successfully applied granular permissions to roles!');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=fix-roles.js.map