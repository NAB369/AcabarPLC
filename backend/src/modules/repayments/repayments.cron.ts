import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class RepaymentsCron {
  private readonly logger = new Logger(RepaymentsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculatePenalties() {
    this.logger.log('Starting daily penalty calculation job...');
    const now = new Date();

    try {
      const overdueSchedules = await this.prisma.repaymentSchedule.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: now, // Due date is in the past
          },
        },
        include: {
          loan: true,
        },
      });

      let updatedCount = 0;

      for (const schedule of overdueSchedules) {
        if (!schedule.loan.penaltyRate) continue; // Skip if loan has no penalty rate

        // Calculate days late
        const diffTime = Math.abs(now.getTime() - schedule.dueDate.getTime());
        const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Simple penalty formula: (Amount Due * Penalty Rate / 365) * Days Late
        // Note: penaltyRate is assumed to be an annual percentage (e.g. 18 for 18%)
        const dailyPenaltyRate = schedule.loan.penaltyRate / 100 / 365;
        const penaltyAmount = Number(
          (schedule.amountDue * dailyPenaltyRate * lateDays).toFixed(2),
        );

        await this.prisma.repaymentSchedule.update({
          where: { id: schedule.id },
          data: {
            lateDays,
            penaltyAmount,
          },
        });

        updatedCount++;
      }

      this.logger.log(
        `Successfully calculated penalties for ${updatedCount} overdue schedules.`,
      );
    } catch (error) {
      this.logger.error('Error calculating penalties', error);
    }
  }
}
