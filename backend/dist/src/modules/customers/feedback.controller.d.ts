import { FeedbackService } from './feedback.service';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    findAll(): Promise<({
        customer: {
            firstName: string;
            lastName: string;
            khmerFirstName: string | null;
            khmerLastName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        customerId: string;
        loanId: string | null;
        rating: number;
        comment: string | null;
        category: string;
    })[]>;
    create(body: {
        customerId: string;
        loanId?: string;
        rating: number;
        comment?: string;
        category: string;
    }): Promise<{
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            cid: string | null;
            khmerFirstName: string | null;
            khmerLastName: string | null;
            phone: string;
            nationalId: string | null;
            passport: string | null;
            familyBook: string | null;
            dob: Date | null;
            kycStatus: string;
            employmentStatus: string | null;
            occupation: string | null;
            employerName: string | null;
            businessInfo: string | null;
            monthlyIncome: number | null;
            monthlyIncomeKhr: number | null;
            monthlyExpenses: number | null;
            currency: string;
            businessType: string | null;
            incomeBracket: string | null;
            dependentCount: string | null;
            incomeMaker: string | null;
            gender: string | null;
            maritalStatus: string | null;
            coBorrowerName: string | null;
            coBorrowerKhmerName: string | null;
            coBorrowerPhone: string | null;
            coBorrowerNationalId: string | null;
            guarantorName: string | null;
            guarantorKhmerName: string | null;
            guarantorPhone: string | null;
            guarantorNationalId: string | null;
            guarantorRelationship: string | null;
            accountNumber: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        customerId: string;
        loanId: string | null;
        rating: number;
        comment: string | null;
        category: string;
    }>;
}
