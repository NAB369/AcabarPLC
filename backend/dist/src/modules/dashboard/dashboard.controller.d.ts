import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
}
