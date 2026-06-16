import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class AlertsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingAlerts(): Promise<({
        customer: {
            firstName: string;
            lastName: string;
            phone: string;
        };
        loan: {
            lid: string | null;
            principalAmount: number;
            currency: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        customerId: string;
        type: string;
        message: string;
        loanId: string;
        targetDate: Date;
    })[]>;
    updateAlertStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        customerId: string;
        type: string;
        message: string;
        loanId: string;
        targetDate: Date;
    }>;
}
