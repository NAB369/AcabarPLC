"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database with sample test data...');
    const branch1 = await prisma.branch.upsert({
        where: { name: 'Phnom Penh Head Office' },
        update: {},
        create: {
            name: 'Phnom Penh Head Office',
            code: 'PP001',
            address: 'Preah Norodom Blvd, Phnom Penh',
        },
    });
    const branch2 = await prisma.branch.upsert({
        where: { name: 'Siem Reap Branch' },
        update: {},
        create: {
            name: 'Siem Reap Branch',
            code: 'SR002',
            address: 'Pub Street Area, Siem Reap',
        },
    });
    const permissionsToCreate = [
        { name: 'VIEW_DASHBOARD', description: 'Access to the admin dashboard overview' },
        { name: 'MANAGE_CUSTOMERS', description: 'View, create, and edit customer records' },
        { name: 'MANAGE_KYC', description: 'Verify and review customer KYC documents' },
        { name: 'CREATE_LOAN', description: 'Initiate new loan applications' },
        { name: 'APPROVE_KYC', description: 'LOS Step: KYC Verification and Approval' },
        { name: 'CREDIT_EVALUATE', description: 'LOS Step: Credit scoring and assessment' },
        { name: 'UNDERWRITE_LOAN', description: 'LOS Step: Final underwriting approval' },
        { name: 'MANAGE_DISBURSEMENT', description: 'LOS Step: Prepare and confirm fund disbursement' },
        { name: 'VIEW_AUDIT', description: 'View system-wide audit logs' },
        { name: 'MANAGE_SYSTEM', description: 'System settings and user management' },
        { name: 'VIEW_PERIOD', description: 'Access to system period status and SOD/EOD panel' },
        { name: 'MANAGE_PERIOD', description: 'Ability to run SOD and EOD' },
        { name: 'VIEW_REPORTS', description: 'Access to accountant reports' },
        { name: 'MANAGE_ACCOUNTS', description: 'Create and manage Chart of Accounts' },
        { name: 'MANAGE_JOURNAL', description: 'Post journal entries, income, expense, and transfers' },
        { name: 'VIEW_ACCOUNTS', description: 'View chart of accounts and account balances' },
    ];
    const permissionMap = {};
    for (const perm of permissionsToCreate) {
        permissionMap[perm.name] = await prisma.permission.upsert({
            where: { name: perm.name },
            update: { description: perm.description },
            create: perm,
        });
    }
    const rolesToCreate = [
        {
            name: 'SUPER_ADMIN',
            description: 'Full system access',
            perms: permissionsToCreate.map(p => p.name)
        },
        {
            name: 'BRANCH_MANAGER',
            description: 'Branch oversight and high-level approvals',
            perms: ['VIEW_DASHBOARD', 'MANAGE_CUSTOMERS', 'APPROVE_KYC', 'UNDERWRITE_LOAN', 'MANAGE_DISBURSEMENT']
        },
        {
            name: 'CREDIT_OFFICER',
            description: 'Front-line loan origination',
            perms: ['VIEW_DASHBOARD', 'MANAGE_CUSTOMERS', 'MANAGE_KYC', 'CREATE_LOAN', 'CREDIT_EVALUATE']
        },
        {
            name: 'COLLECTION_OFFICER',
            description: 'Payment monitoring',
            perms: ['VIEW_DASHBOARD', 'MANAGE_CUSTOMERS']
        },
        {
            name: 'TELLER',
            description: 'Cash operations',
            perms: ['VIEW_DASHBOARD', 'MANAGE_DISBURSEMENT']
        },
        {
            name: 'AUDITOR',
            description: 'Internal audit and compliance',
            perms: ['VIEW_DASHBOARD', 'VIEW_AUDIT']
        },
        {
            name: 'CUSTOMER_SERVICE',
            description: 'Inquiry and registration',
            perms: ['VIEW_DASHBOARD', 'MANAGE_CUSTOMERS']
        },
        {
            name: 'ACCOUNTANT',
            description: 'Financial accounting and period closing operations',
            perms: ['VIEW_DASHBOARD', 'VIEW_PERIOD', 'MANAGE_PERIOD', 'VIEW_REPORTS', 'MANAGE_ACCOUNTS', 'MANAGE_JOURNAL', 'VIEW_ACCOUNTS']
        },
    ];
    for (const roleData of rolesToCreate) {
        const role = await prisma.role.upsert({
            where: { name: roleData.name },
            update: { description: roleData.description },
            create: { name: roleData.name, description: roleData.description },
        });
        for (const permName of roleData.perms) {
            const perm = permissionMap[permName];
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: perm.id,
                    },
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: perm.id,
                },
            });
        }
    }
    const loanOfficerRole = await prisma.role.findUnique({ where: { name: 'CREDIT_OFFICER' } });
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (!loanOfficerRole || !superAdminRole) {
        throw new Error('Required roles not found after creation');
    }
    const passwordHash = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@weloan365.com' },
        update: {},
        create: {
            email: 'admin@weloan365.com',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            isApproved: true,
            branchId: branch1.id,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: admin.id,
                roleId: superAdminRole.id,
            },
        },
        update: {},
        create: {
            userId: admin.id,
            roleId: superAdminRole.id,
        },
    });
    const officer = await prisma.user.upsert({
        where: { email: 'chamnab@weloan365.com' },
        update: {},
        create: {
            email: 'chamnab@weloan365.com',
            passwordHash,
            firstName: 'Chamnab',
            lastName: 'Kol',
            isApproved: true,
            branchId: branch1.id,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: officer.id,
                roleId: loanOfficerRole.id,
            },
        },
        update: {},
        create: {
            userId: officer.id,
            roleId: loanOfficerRole.id,
        },
    });
    const accountantRole = await prisma.role.findUnique({ where: { name: 'ACCOUNTANT' } });
    if (!accountantRole) {
        throw new Error('ACCOUNTANT role not found');
    }
    const accountantUser = await prisma.user.upsert({
        where: { email: 'accountant@weloan365.com' },
        update: {},
        create: {
            email: 'accountant@weloan365.com',
            passwordHash,
            firstName: 'Accountant',
            lastName: 'User',
            isApproved: true,
            branchId: branch1.id,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: accountantUser.id,
                roleId: accountantRole.id,
            },
        },
        update: {},
        create: {
            userId: accountantUser.id,
            roleId: accountantRole.id,
        },
    });
    const product1 = await prisma.loanProduct.upsert({
        where: { name: 'Personal Loan' },
        update: {},
        create: {
            name: 'Personal Loan',
            description: 'Standard personal loan for individuals',
            minAmount: 500,
            maxAmount: 10000,
            baseInterestRate: 12.0,
            interestType: 'FLAT',
        },
    });
    const product2 = await prisma.loanProduct.upsert({
        where: { name: 'SME Business Loan' },
        update: {},
        create: {
            name: 'SME Business Loan',
            description: 'Loan for small and medium enterprises',
            minAmount: 5000,
            maxAmount: 50000,
            baseInterestRate: 10.0,
            interestType: 'REDUCING',
        },
    });
    await prisma.company.upsert({
        where: { id: 'default-company' },
        update: {},
        create: {
            id: 'default-company',
            name: 'KOSIGN',
            industry: 'Financial Technology',
            size: '50-100 Employees',
            website: 'www.kosign.com.kh',
            address: 'Phnom Penh, Cambodia',
            phone: '+855 23 999 888',
            email: 'info@kosign.com.kh',
        },
    });
    await prisma.systemState.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            businessDate: new Date(),
            isOpen: true,
        },
    });
    const chartOfAccounts = [
        { code: '10100', name: 'Cash Vault (USD)', nameKh: 'ប្រាក់សុទ្ធ (USD)', type: 'ASSET', normalBal: 'DEBIT', description: 'Physical cash held in USD' },
        { code: '10110', name: 'Cash Vault (KHR)', nameKh: 'ប្រាក់សុទ្ធ (KHR)', type: 'ASSET', normalBal: 'DEBIT', description: 'Physical cash held in KHR' },
        { code: '10200', name: 'Bank Account', nameKh: 'គណនីធនាគារ', type: 'ASSET', normalBal: 'DEBIT', description: 'Funds deposited in bank' },
        { code: '12100', name: 'Loan Portfolio', nameKh: 'ផលប័ត្រប្រាក់កម្ចី', type: 'ASSET', normalBal: 'DEBIT', description: 'Outstanding loan principal balances' },
        { code: '12200', name: 'Interest Receivable', nameKh: 'ការប្រាក់ត្រូវទទួល', type: 'ASSET', normalBal: 'DEBIT', description: 'Accrued but uncollected interest' },
        { code: '12300', name: 'Allowance for Loan Loss', nameKh: 'ការរំលស់ប្រាក់កម្ចី', type: 'ASSET', normalBal: 'CREDIT', description: 'Provision for non-performing loans' },
        { code: '20100', name: 'Customer Deposits', nameKh: 'ប្រាក់បញ្ញើអតិថិជន', type: 'LIABILITY', normalBal: 'CREDIT', description: 'Savings and deposits from clients' },
        { code: '20200', name: 'Borrowings', nameKh: 'ការខ្ចីប្រាក់', type: 'LIABILITY', normalBal: 'CREDIT', description: 'Funds borrowed from external sources' },
        { code: '20300', name: 'Accounts Payable', nameKh: 'បញ្ជីត្រូវបង់', type: 'LIABILITY', normalBal: 'CREDIT', description: 'Amounts owed to suppliers/staff' },
        { code: '30100', name: 'Equity / Seed Capital', nameKh: 'ភាគហ៊ុន / ទុនដើម', type: 'EQUITY', normalBal: 'CREDIT', description: 'Shareholder equity and initial capital' },
        { code: '30200', name: 'Retained Earnings', nameKh: 'ប្រាក់ចំណេញសល់', type: 'EQUITY', normalBal: 'CREDIT', description: 'Accumulated profits retained' },
        { code: '40100', name: 'Interest Income', nameKh: 'ចំណូលការប្រាក់', type: 'REVENUE', normalBal: 'CREDIT', description: 'Interest earned on loans' },
        { code: '40200', name: 'Penalty Income', nameKh: 'ចំណូលពីការផាក់ពិន័យ', type: 'REVENUE', normalBal: 'CREDIT', description: 'Late payment penalties' },
        { code: '40300', name: 'Processing Fee Income', nameKh: 'ចំណូលសេវាកម្ម', type: 'REVENUE', normalBal: 'CREDIT', description: 'Loan processing and admin fees' },
        { code: '40400', name: 'Other Income', nameKh: 'ចំណូលផ្សេងៗ', type: 'REVENUE', normalBal: 'CREDIT', description: 'Miscellaneous income' },
        { code: '50100', name: 'Salary Expense', nameKh: 'ចំណាយប្រាក់ខែ', type: 'EXPENSE', normalBal: 'DEBIT', description: 'Employee salaries and wages' },
        { code: '50200', name: 'Rent Expense', nameKh: 'ចំណាយថ្លៃជួល', type: 'EXPENSE', normalBal: 'DEBIT', description: 'Office and branch rental' },
        { code: '50300', name: 'Utilities Expense', nameKh: 'ចំណាយប្រើប្រាស់', type: 'EXPENSE', normalBal: 'DEBIT', description: 'Electricity, water, internet' },
        { code: '50400', name: 'Loan Loss Provision', nameKh: 'ការរំលស់ប្រាក់កម្ចី', type: 'EXPENSE', normalBal: 'DEBIT', description: 'Expense for provisioning loan losses' },
        { code: '50500', name: 'Marketing Expense', nameKh: 'ចំណាយទីផ្សារ', type: 'EXPENSE', normalBal: 'DEBIT', description: 'Advertising and marketing costs' },
        { code: '50600', name: 'Other Expense', nameKh: 'ចំណាយផ្សេងៗ', type: 'EXPENSE', normalBal: 'DEBIT', description: 'Miscellaneous expenses' },
    ];
    for (const acct of chartOfAccounts) {
        await prisma.account.upsert({
            where: { code: acct.code },
            update: { name: acct.name, nameKh: acct.nameKh, type: acct.type, normalBal: acct.normalBal, description: acct.description },
            create: acct,
        });
    }
    console.log('Seeding completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map