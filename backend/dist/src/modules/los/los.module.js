"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LosModule = void 0;
const common_1 = require("@nestjs/common");
const los_controller_1 = require("./los.controller");
const los_service_1 = require("./los.service");
const underwriting_module_1 = require("../underwriting/underwriting.module");
const kyc_module_1 = require("../kyc/kyc.module");
const disbursement_module_1 = require("../disbursement/disbursement.module");
let LosModule = class LosModule {
};
exports.LosModule = LosModule;
exports.LosModule = LosModule = __decorate([
    (0, common_1.Module)({
        imports: [underwriting_module_1.UnderwritingModule, kyc_module_1.KycModule, disbursement_module_1.DisbursementModule],
        controllers: [los_controller_1.LosController],
        providers: [los_service_1.LosService],
        exports: [los_service_1.LosService],
    })
], LosModule);
//# sourceMappingURL=los.module.js.map