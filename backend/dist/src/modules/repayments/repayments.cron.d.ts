import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class RepaymentsCron {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculatePenalties(): Promise<void>;
}
