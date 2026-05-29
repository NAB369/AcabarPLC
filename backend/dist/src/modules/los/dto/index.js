"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGuarantorDto = exports.AddCollateralDto = exports.ReviewDecisionDto = exports.SubmitApplicationDto = exports.CreateDraftDto = void 0;
class CreateDraftDto {
    lid;
    customerId;
    productId;
    principalAmount;
    durationMonths;
    currency;
    applicationChannel;
    loanOfficerId;
    disbursementDate;
    repaymentType;
    firstInstallmentDate;
    numberOfInstallments;
    interestRate;
    penaltyRate;
    adminFeeRate;
    collectionFeeType;
    collectionFeeValue;
    gracePeriod;
    refinanceFeeAmt;
    loanCycle;
    recommenderType;
    branchId;
    reasonOfCredit;
    loanNote;
    memoReasonOfCredit;
    collaterals;
}
exports.CreateDraftDto = CreateDraftDto;
class SubmitApplicationDto {
}
exports.SubmitApplicationDto = SubmitApplicationDto;
class ReviewDecisionDto {
    decision;
    comments;
}
exports.ReviewDecisionDto = ReviewDecisionDto;
class AddCollateralDto {
    type;
    description;
    estimatedValue;
    currency;
    documentIds;
}
exports.AddCollateralDto = AddCollateralDto;
class AddGuarantorDto {
    firstName;
    lastName;
    nationalId;
    phone;
    relationship;
}
exports.AddGuarantorDto = AddGuarantorDto;
//# sourceMappingURL=index.js.map