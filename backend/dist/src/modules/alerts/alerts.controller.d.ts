import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getAlerts(): Promise<({
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
    updateStatus(id: string, status: string): Promise<{
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
