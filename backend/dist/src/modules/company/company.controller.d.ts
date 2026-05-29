import { CompanyService } from './company.service';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getCompany(): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        industry: string | null;
        size: string | null;
        website: string | null;
        logoUrl: string | null;
        sidebarConfig: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateCompany(data: any): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        name: string;
        address: string | null;
        phone: string | null;
        industry: string | null;
        size: string | null;
        website: string | null;
        logoUrl: string | null;
        sidebarConfig: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
