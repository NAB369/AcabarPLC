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
exports.ConsultationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let ConsultationsService = class ConsultationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.consultation.findMany({
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        khmerFirstName: true,
                        khmerLastName: true,
                        phone: true,
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.consultation.create({
            data: {
                customerId: data.customerId,
                type: data.type,
                scheduledAt: new Date(data.scheduledAt),
                notes: data.notes,
                status: 'PENDING',
            },
            include: { customer: true },
        });
    }
    async updateStatus(id, status) {
        const existing = await this.prisma.consultation.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Consultation not found');
        return this.prisma.consultation.update({
            where: { id },
            data: { status },
            include: { customer: true },
        });
    }
};
exports.ConsultationsService = ConsultationsService;
exports.ConsultationsService = ConsultationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConsultationsService);
//# sourceMappingURL=consultations.service.js.map