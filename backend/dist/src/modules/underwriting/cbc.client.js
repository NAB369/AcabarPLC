"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CbcClient = void 0;
class CbcClient {
    async queryCredit(nationalId) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const lastDigit = parseInt(nationalId.slice(-1), 10) || 0;
        if (lastDigit === 0) {
            return {
                cbcScore: 180,
                totalExposure: 50000,
                activeLoans: 5,
                delinquencyFlag: true,
                reportData: { mock: true, scenario: 'blacklisted' },
            };
        }
        if (lastDigit <= 3) {
            return {
                cbcScore: 350 + lastDigit * 20,
                totalExposure: 8000 + lastDigit * 1000,
                activeLoans: 3,
                delinquencyFlag: false,
                reportData: { mock: true, scenario: 'risky' },
            };
        }
        if (lastDigit <= 6) {
            return {
                cbcScore: 500 + lastDigit * 15,
                totalExposure: 3000 + lastDigit * 500,
                activeLoans: 1,
                delinquencyFlag: false,
                reportData: { mock: true, scenario: 'moderate' },
            };
        }
        return {
            cbcScore: 700 + lastDigit * 10,
            totalExposure: 1000,
            activeLoans: 0,
            delinquencyFlag: false,
            reportData: { mock: true, scenario: 'prime' },
        };
    }
    async hasDelinquency(nationalId) {
        const report = await this.queryCredit(nationalId);
        return report.delinquencyFlag;
    }
}
exports.CbcClient = CbcClient;
//# sourceMappingURL=cbc.client.js.map