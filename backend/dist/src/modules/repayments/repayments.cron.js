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
var RepaymentsCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepaymentsCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let RepaymentsCron = RepaymentsCron_1 = class RepaymentsCron {
    prisma;
    logger = new common_1.Logger(RepaymentsCron_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculatePenalties() {
        this.logger.log('Starting daily penalty calculation job...');
        const now = new Date();
        try {
            const overdueSchedules = await this.prisma.repaymentSchedule.findMany({
                where: {
                    status: 'PENDING',
                    dueDate: {
                        lt: now,
                    },
                },
                include: {
                    loan: true,
                },
            });
            let updatedCount = 0;
            for (const schedule of overdueSchedules) {
                if (!schedule.loan.penaltyRate)
                    continue;
                const diffTime = Math.abs(now.getTime() - schedule.dueDate.getTime());
                const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const dailyPenaltyRate = (schedule.loan.penaltyRate / 100) / 365;
                const penaltyAmount = Number((schedule.amountDue * dailyPenaltyRate * lateDays).toFixed(2));
                await this.prisma.repaymentSchedule.update({
                    where: { id: schedule.id },
                    data: {
                        lateDays,
                        penaltyAmount,
                    },
                });
                updatedCount++;
            }
            this.logger.log(`Successfully calculated penalties for ${updatedCount} overdue schedules.`);
        }
        catch (error) {
            this.logger.error('Error calculating penalties', error);
        }
    }
};
exports.RepaymentsCron = RepaymentsCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RepaymentsCron.prototype, "calculatePenalties", null);
exports.RepaymentsCron = RepaymentsCron = RepaymentsCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepaymentsCron);
//# sourceMappingURL=repayments.cron.js.map