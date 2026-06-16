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
            currency: string;
            lid: string | null;
            principalAmount: number;
        };
    } & {
        type: string;
        id: string;
        createdAt: Date;
        message: string;
        customerId: string;
        status: string;
        loanId: string;
        targetDate: Date;
    })[]>;
    updateStatus(id: string, status: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        message: string;
        customerId: string;
        status: string;
        loanId: string;
        targetDate: Date;
    }>;
}
