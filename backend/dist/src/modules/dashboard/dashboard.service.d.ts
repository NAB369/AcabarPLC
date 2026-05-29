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
}
