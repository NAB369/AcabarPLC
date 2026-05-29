"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDti = calculateDti;
function calculateDti(input) {
    if (input.monthlyIncome <= 0) {
        return {
            dtiRatio: Infinity,
            dtiPercentage: Infinity,
            disposableIncome: -input.existingLoanPayments - input.proposedEmi,
            riskLevel: 'CRITICAL',
        };
    }
    const totalDebtPayments = input.existingLoanPayments + input.proposedEmi;
    const dtiRatio = totalDebtPayments / input.monthlyIncome;
    const dtiPercentage = Math.round(dtiRatio * 10000) / 100;
    const disposableIncome = input.monthlyIncome - input.monthlyExpenses - totalDebtPayments;
    let riskLevel;
    if (dtiRatio <= 0.35)
        riskLevel = 'LOW';
    else if (dtiRatio <= 0.5)
        riskLevel = 'MODERATE';
    else if (dtiRatio <= 0.7)
        riskLevel = 'HIGH';
    else
        riskLevel = 'CRITICAL';
    return { dtiRatio, dtiPercentage, disposableIncome, riskLevel };
}
//# sourceMappingURL=dti-calculator.js.map