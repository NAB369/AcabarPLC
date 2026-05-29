"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCustomerDto) {
        const cleanedData = { ...createCustomerDto };
        for (const key of Object.keys(cleanedData)) {
            if (cleanedData[key] === '') {
                cleanedData[key] = null;
            }
        }
        const { phone, email, nationalId } = cleanedData;
        const existingPhone = await this.prisma.customer.findUnique({
            where: { phone },
        });
        if (existingPhone) {
            throw new common_1.ConflictException(`Phone number ${phone} is already registered`);
        }
        if (email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException(`Email ${email} is already registered`);
            }
        }
        if (nationalId) {
            const existingNationalId = await this.prisma.customer.findUnique({
                where: { nationalId },
            });
            if (existingNationalId) {
                throw new common_1.ConflictException(`National ID ${nationalId} is already registered`);
            }
        }
        return this.prisma.customer.create({
            data: {
                ...cleanedData,
                kycStatus: 'PENDING',
            },
        });
    }
    async findAll() {
        return this.prisma.customer.findMany({
            include: { branch: true },
        });
    }
    async search(query) {
        if (!query || !query.trim())
            return this.findAll();
        const trimmedQuery = query.trim();
        const parts = trimmedQuery.split(/\s+/).filter(Boolean);
        if (parts.length > 1) {
            return this.prisma.customer.findMany({
                where: {
                    OR: [
                        {
                            AND: [
                                { firstName: { contains: parts[0] } },
                                { lastName: { contains: parts[1] } },
                            ],
                        },
                        {
                            AND: [
                                { firstName: { contains: parts[1] } },
                                { lastName: { contains: parts[0] } },
                            ],
                        },
                        { firstName: { contains: trimmedQuery } },
                        { lastName: { contains: trimmedQuery } },
                        { khmerFirstName: { contains: trimmedQuery } },
                        { khmerLastName: { contains: trimmedQuery } },
                        { cid: { contains: trimmedQuery } },
                        { email: { contains: trimmedQuery } },
                        { phone: { contains: trimmedQuery } },
                        { nationalId: { contains: trimmedQuery } },
                        { passport: { contains: trimmedQuery } },
                    ],
                },
                take: 10,
            });
        }
        return this.prisma.customer.findMany({
            where: {
                OR: [
                    { firstName: { contains: trimmedQuery } },
                    { lastName: { contains: trimmedQuery } },
                    { khmerFirstName: { contains: trimmedQuery } },
                    { khmerLastName: { contains: trimmedQuery } },
                    { cid: { contains: trimmedQuery } },
                    { email: { contains: trimmedQuery } },
                    { phone: { contains: trimmedQuery } },
                    { nationalId: { contains: trimmedQuery } },
                    { passport: { contains: trimmedQuery } },
                ],
            },
            take: 10,
        });
    }
    async getNextCid() {
        const lastCustomer = await this.prisma.customer.findFirst({
            where: {
                cid: {
                    startsWith: 'CID-',
                },
            },
            orderBy: {
                cid: 'desc',
            },
        });
        if (!lastCustomer || !lastCustomer.cid) {
            return { cid: 'CID-000001' };
        }
        const currentNumber = parseInt(lastCustomer.cid.replace('CID-', ''), 10);
        if (isNaN(currentNumber)) {
            return { cid: 'CID-000001' };
        }
        const nextNumber = currentNumber + 1;
        return { cid: `CID-${String(nextNumber).padStart(6, '0')}` };
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { loans: true, documents: true },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return customer;
    }
    async update(id, updateCustomerDto) {
        const cleanedData = { ...updateCustomerDto };
        for (const key of Object.keys(cleanedData)) {
            if (cleanedData[key] === '') {
                cleanedData[key] = null;
            }
        }
        const { phone, email, nationalId } = cleanedData;
        if (phone) {
            const existingPhone = await this.prisma.customer.findFirst({
                where: { phone, id: { not: id } },
            });
            if (existingPhone) {
                throw new common_1.ConflictException(`Phone number ${phone} is already registered to another customer`);
            }
        }
        if (email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email, id: { not: id } },
            });
            if (existingEmail) {
                throw new common_1.ConflictException(`Email ${email} is already registered to another customer`);
            }
        }
        if (nationalId) {
            const existingNationalId = await this.prisma.customer.findFirst({
                where: { nationalId, id: { not: id } },
            });
            if (existingNationalId) {
                throw new common_1.ConflictException(`National ID ${nationalId} is already registered to another customer`);
            }
        }
        return this.prisma.customer.update({
            where: { id },
            data: cleanedData,
        });
    }
    async remove(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { _count: { select: { loans: true } } },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        if (customer._count.loans > 0) {
            throw new common_1.ConflictException('Cannot delete customer with active or past loans');
        }
        return this.prisma.customer.delete({
            where: { id },
        });
    }
    async updateKyc(id, updateKycDto) {
        return this.prisma.customer.update({
            where: { id },
            data: { kycStatus: updateKycDto.status },
        });
    }
    async syncKycFromLoans() {
        const APPROVED_LOAN_STATUSES = [
            'DISBURSED',
            'ACTIVE',
            'COMPLETED',
            'PENDING_DISBURSEMENT',
        ];
        const customers = await this.prisma.customer.findMany({
            where: {
                kycStatus: 'PENDING',
                loans: {
                    some: { status: { in: APPROVED_LOAN_STATUSES } },
                },
            },
            select: { id: true },
        });
        if (customers.length === 0) {
            return { updated: 0, customerIds: [] };
        }
        const ids = customers.map((c) => c.id);
        await this.prisma.customer.updateMany({
            where: { id: { in: ids } },
            data: { kycStatus: 'APPROVED' },
        });
        return { updated: ids.length, customerIds: ids };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map