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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const shipments_service_1 = require("./shipments.service");
const api_key_guard_1 = require("../common/guards/api-key.guard");
let ShipmentsController = class ShipmentsController {
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    findAll() {
        return this.shipmentsService.findAllShipments();
    }
    create(body) {
        return this.shipmentsService.createShipment(body);
    }
    updateStatus(manifestId, status) {
        return this.shipmentsService.updateShipmentStatus(manifestId, status);
    }
    findCheckpoints(shipmentId) {
        return this.shipmentsService.findCheckpoints(shipmentId);
    }
    upsertCheckpoint(body) {
        return this.shipmentsService.upsertCheckpoint(body);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Get)('shipments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('shipments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('shipments/:manifestId'),
    __param(0, (0, common_1.Param)('manifestId')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('checkpoints'),
    __param(0, (0, common_1.Query)('shipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findCheckpoints", null);
__decorate([
    (0, common_1.Post)('checkpoints'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "upsertCheckpoint", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.Controller)('api'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map