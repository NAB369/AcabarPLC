import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class CompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    getCompany(): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        name: string;
        address: string | null;
        industry: string | null;
        size: string | null;
        website: string | null;
        phone: string | null;
        logoUrl: string | null;
        sidebarConfig: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateCompany(data: any): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        name: string;
        address: string | null;
        industry: string | null;
        size: string | null;
        website: string | null;
        phone: string | null;
        logoUrl: string | null;
        sidebarConfig: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
