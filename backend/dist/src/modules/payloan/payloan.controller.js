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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloanController = void 0;
const common_1 = require("@nestjs/common");
const payloan_service_1 = require("./payloan.service");
const payloan_dto_1 = require("./payloan.dto");
let PayloanController = class PayloanController {
    payloanService;
    constructor(payloanService) {
        this.payloanService = payloanService;
    }
    async handleCallback(dto) {
        return this.payloanService.processCallback(dto);
    }
    async getNotifications() {
        return this.payloanService.getAllNotifications();
    }
};
exports.PayloanController = PayloanController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payloan_dto_1.PayloanCallbackDto]),
    __metadata("design:returntype", Promise)
], PayloanController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayloanController.prototype, "getNotifications", null);
exports.PayloanController = PayloanController = __decorate([
    (0, common_1.Controller)('client/wb/v1/payloan-callback'),
    __metadata("design:paramtypes", [payloan_service_1.PayloanService])
], PayloanController);
//# sourceMappingURL=payloan.controller.js.map