import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DtiResult } from './dti-calculator';
import { UnderwritingDecision } from './rules-engine';
export declare class UnderwritingService {
    private prisma;
    private cbcClient;
    constructor(prisma: PrismaService);
    evaluateLoan(loanId: string): Promise<{
        decision: UnderwritingDecision;
        dti: DtiResult;
        cbcScore: number | null;
    }>;
}
