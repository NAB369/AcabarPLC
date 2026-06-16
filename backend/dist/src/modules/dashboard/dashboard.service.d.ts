import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getMetrics(): Promise<{
        overview: {
            totalVolume: number;
            overdueCount: number;
            completedCount: number;
            avgLoanValue: number;
        };
        chartData: {
            name: string;
            value: number;
        }[];
    }>;
    getCreditOfficerReport(): Promise<any[]>;
    getRecentPaymentsReport(): Promise<{
        id: string;
        date: Date;
        reference: string;
        customerName: string;
        loanId: string;
        amount: number;
        principal: number;
        interest: number;
        penalty: number;
        description: string | null;
    }[]>;
}
