"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
exports.getNextApprovalTier = getNextApprovalTier;
const TRANSITIONS = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['KYC_REVIEW'],
    KYC_REVIEW: ['KYC_APPROVED', 'KYC_REJECTED'],
    KYC_APPROVED: ['CREDIT_CHECK'],
    CREDIT_CHECK: ['UNDERWRITING'],
    UNDERWRITING: ['TIER1_REVIEW', 'AUTO_REJECTED'],
    TIER1_REVIEW: ['APPROVED', 'REJECTED', 'TIER2_REVIEW'],
    TIER2_REVIEW: ['APPROVED', 'REJECTED', 'TIER3_REVIEW'],
    TIER3_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['PENDING_DISBURSEMENT'],
    PENDING_DISBURSEMENT: ['DISBURSED'],
    DISBURSED: ['ACTIVE'],
    ACTIVE: ['COMPLETED', 'OVERDUE'],
    OVERDUE: ['ACTIVE', 'DEFAULTED'],
};
function canTransition(from, to) {
    const allowed = TRANSITIONS[from]?.includes(to) ?? false;
    return {
        allowed,
        reason: allowed
            ? undefined
            : `Transition from ${from} to ${to} is not allowed`,
    };
}
function getNextApprovalTier(amount) {
    if (amount < 500)
        return 'TIER1_REVIEW';
    if (amount < 5000)
        return 'TIER2_REVIEW';
    return 'TIER3_REVIEW';
}
//# sourceMappingURL=los-state-machine.js.map