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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const [totalVolume, overdueCount, completedCount, avgLoanValue, loansForChart,] = await Promise.all([
            this.prisma.loan.aggregate({
                _sum: { principalAmount: true },
                where: { status: { in: ['DISBURSED', 'ACTIVE', 'COMPLETED'] } },
            }),
            this.prisma.loan.count({ where: { status: 'OVERDUE' } }),
            this.prisma.loan.count({ where: { status: 'COMPLETED' } }),
            this.prisma.loan.aggregate({
                _avg: { principalAmount: true },
            }),
            this.prisma.loan.findMany({
                where: {
                    status: { in: ['DISBURSED', 'ACTIVE', 'COMPLETED'] },
                    createdAt: {
                        gte: new Date(currentYear, 0, 1),
                    },
                },
                select: {
                    principalAmount: true,
                    createdAt: true,
                },
            }),
        ]);
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const monthlyData = monthNames.map((name) => ({ name, value: 0 }));
        loansForChart.forEach((loan) => {
            const monthIndex = loan.createdAt.getMonth();
            monthlyData[monthIndex].value += loan.principalAmount;
        });
        return {
            overview: {
                totalVolume: totalVolume._sum.principalAmount || 0,
                overdueCount,
                completedCount,
                avgLoanValue: Math.round(avgLoanValue._avg.principalAmount || 0),
            },
            chartData: monthlyData,
        };
    }
    async getCreditOfficerReport() {
        const loans = await this.prisma.loan.findMany({
            where: { loanOfficerId: { not: null } },
            include: {
                loanOfficer: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        const report = loans.reduce((acc, loan) => {
            const officerId = loan.loanOfficerId;
            if (!acc[officerId]) {
                acc[officerId] = {
                    officerId,
                    officerName: `${loan.loanOfficer?.firstName} ${loan.loanOfficer?.lastName}`,
                    officerEmail: loan.loanOfficer?.email,
                    totalLoans: 0,
                    totalVolume: 0,
                    overdueCount: 0,
                    riskBands: { A: 0, B: 0, C: 0, D: 0, Unscored: 0 },
                };
            }
            acc[officerId].totalLoans++;
            acc[officerId].totalVolume += loan.principalAmount;
            if (loan.status === 'OVERDUE')
                acc[officerId].overdueCount++;
            const band = loan.creditRiskBand?.charAt(0) || 'Unscored';
            if (acc[officerId].riskBands[band] !== undefined) {
                acc[officerId].riskBands[band]++;
            }
            else {
                acc[officerId].riskBands['Unscored']++;
            }
            return acc;
        }, {});
        return Object.values(report);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map