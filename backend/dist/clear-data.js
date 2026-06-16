"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function clearData() {
    console.log('Starting safe data clear...');
    try {
        console.log('Clearing RepaymentSchedule...');
        await prisma.repaymentSchedule.deleteMany({});
        console.log('Clearing LoanCollateral...');
        await prisma.collateral.deleteMany({});
        console.log('Clearing LoanGuarantor...');
        await prisma.guarantor.deleteMany({});
        console.log('Clearing ApprovalStep...');
        await prisma.approvalStep.deleteMany({});
        console.log('Clearing ClientAlert...');
        await prisma.clientAlert.deleteMany({});
        console.log('Clearing Loan...');
        await prisma.loan.deleteMany({});
        console.log('Clearing KycDocument...');
        await prisma.document.deleteMany({});
        console.log('Clearing Consultation...');
        await prisma.consultation.deleteMany({});
        console.log('Clearing CreditReport...');
        await prisma.creditReport.deleteMany({});
        console.log('Clearing Feedback...');
        await prisma.feedback.deleteMany({});
        console.log('Clearing Customer...');
        await prisma.customer.deleteMany({});
        console.log('Clearing LedgerEntry...');
        await prisma.ledgerEntry.deleteMany({});
        console.log('Clearing JournalEntry...');
        await prisma.journalEntry.deleteMany({});
        console.log('Data cleared successfully. Users, Roles, Branches, and Products are intact.');
    }
    catch (error) {
        console.error('Error clearing data:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
clearData();
//# sourceMappingURL=clear-data.js.map