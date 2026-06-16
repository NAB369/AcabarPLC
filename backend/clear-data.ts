import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('Starting safe data clear...');
  try {
    // Transactional tables to clear
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
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
