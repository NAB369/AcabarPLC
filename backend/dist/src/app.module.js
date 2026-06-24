"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const customers_module_1 = require("./modules/customers/customers.module");
const loans_module_1 = require("./modules/loans/loans.module");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const repayments_module_1 = require("./modules/repayments/repayments.module");
const ledger_module_1 = require("./modules/ledger/ledger.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const los_module_1 = require("./modules/los/los.module");
const kyc_module_1 = require("./modules/kyc/kyc.module");
const underwriting_module_1 = require("./modules/underwriting/underwriting.module");
const disbursement_module_1 = require("./modules/disbursement/disbursement.module");
const branches_module_1 = require("./modules/branches/branches.module");
const company_module_1 = require("./modules/company/company.module");
const payloan_module_1 = require("./modules/payloan/payloan.module");
const period_module_1 = require("./modules/period/period.module");
const accounting_module_1 = require("./modules/accounting/accounting.module");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const schedule_1 = require("@nestjs/schedule");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            customers_module_1.CustomersModule,
            loans_module_1.LoansModule,
            repayments_module_1.RepaymentsModule,
            ledger_module_1.LedgerModule,
            dashboard_module_1.DashboardModule,
            los_module_1.LosModule,
            kyc_module_1.KycModule,
            underwriting_module_1.UnderwritingModule,
            disbursement_module_1.DisbursementModule,
            branches_module_1.BranchesModule,
            company_module_1.CompanyModule,
            payloan_module_1.PayloanModule,
            period_module_1.PeriodModule,
            accounting_module_1.AccountingModule,
            alerts_module_1.AlertsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map