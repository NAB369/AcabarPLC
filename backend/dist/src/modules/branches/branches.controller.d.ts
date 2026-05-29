import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class BranchesController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        code: string;
        address: string | null;
    }[]>;
}
