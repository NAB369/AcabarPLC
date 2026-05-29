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
exports.PayloanCallbackDto = void 0;
const class_validator_1 = require("class-validator");
class PayloanCallbackDto {
    bill_no;
    transaction_id;
    transaction_date;
    transaction_time;
    payer_account_no;
    payer_name;
    currency_code;
    payment_method;
    amount;
    sender_bank_name;
    sender_account_name;
    settlement_date;
    settlement_time;
    settlement_status;
    settlement_error_message;
    remark;
    bank_transaction_id;
}
exports.PayloanCallbackDto = PayloanCallbackDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "bill_no", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PayloanCallbackDto.prototype, "transaction_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "transaction_date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "transaction_time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "payer_account_no", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "payer_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "currency_code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "payment_method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PayloanCallbackDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "sender_bank_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "sender_account_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "settlement_date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "settlement_time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "settlement_status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "settlement_error_message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "remark", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PayloanCallbackDto.prototype, "bank_transaction_id", void 0);
//# sourceMappingURL=payloan.dto.js.map