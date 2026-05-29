"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
function evaluate(input) {
    const reasons = [];
    if (input.annualInterestRate > 18) {
        reasons.push('Interest rate exceeds NBC cap of 18%');
        return { decision: 'AUTO_REJECT', reasons };
    }
    if (input.cbcScore !== null && input.cbcScore < 300) {
        reasons.push('CBC score below minimum threshold (300)');
    }
    if (input.delinquencyFlag) {
        reasons.push('Active delinquency reported by CBC');
    }
    if (input.dtiRatio > 0.7) {
        reasons.push('Debt-to-Income ratio exceeds 70%');
    }
    if (reasons.length > 0) {
        return { decision: 'AUTO_REJECT', reasons };
    }
    let tier;
    if (input.principalAmount < 500) {
        tier = 'TIER1_REVIEW';
    }
    else if (input.principalAmount < 5000) {
        tier = 'TIER2_REVIEW';
    }
    else {
        tier = 'TIER3_REVIEW';
    }
    if (input.dtiRatio > 0.5) {
        reasons.push('DTI ratio above 50% — requires careful review');
    }
    if (input.cbcScore !== null && input.cbcScore < 500) {
        reasons.push('CBC score is below recommended threshold (500)');
    }
    return { decision: 'MANUAL_REVIEW', tier, reasons };
}
//# sourceMappingURL=rules-engine.js.map