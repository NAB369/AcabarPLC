import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const now = new Date();
    const currentYear = now.getFullYear();

    const [
      totalVolume,
      overdueCount,
      completedCount,
      avgLoanValue,
      loansForChart,
    ] = await Promise.all([
      // 1. Total Volume (Sum of disbursed loans)
      this.prisma.loan.aggregate({
        _sum: { principalAmount: true },
        where: { status: { in: ['DISBURSED', 'ACTIVE', 'COMPLETED'] } },
      }),
      // 2. Overdue Count
      this.prisma.loan.count({ where: { status: 'OVERDUE' } }),
      // 3. Completed Count
      this.prisma.loan.count({ where: { status: 'COMPLETED' } }),
      // 4. Avg Loan Value
      this.prisma.loan.aggregate({
        _avg: { principalAmount: true },
      }),
      // 5. Raw data for chart (this year)
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

    // Process chart data (Group by month)
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
}
