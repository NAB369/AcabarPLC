import { RepaymentsService, ProcessRepaymentDto } from './repayments.service';
export declare class RepaymentsController {
    private readonly repaymentsService;
    constructor(repaymentsService: RepaymentsService);
    processRepayment(dto: ProcessRepaymentDto, file?: Express.Multer.File): Promise<{
        success: boolean;
        transactionReference: string;
        message: string;
    }>;
    simulateKhqrPayment(dto: ProcessRepaymentDto): Promise<{
        success: boolean;
        transactionReference: string;
        message: string;
    }>;
}
