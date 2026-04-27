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
exports.Checkpoint = void 0;
const typeorm_1 = require("typeorm");
const shipment_entity_1 = require("./shipment.entity");
let Checkpoint = class Checkpoint {
};
exports.Checkpoint = Checkpoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Checkpoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Checkpoint.prototype, "shipment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Checkpoint.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Checkpoint.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Checkpoint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { default: 0 }),
    __metadata("design:type", Number)
], Checkpoint.prototype, "volume_recorded", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { default: 0 }),
    __metadata("design:type", Number)
], Checkpoint.prototype, "variance", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Checkpoint.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shipment_entity_1.Shipment, shipment => shipment.checkpoints),
    (0, typeorm_1.JoinColumn)({ name: 'shipment_id', referencedColumnName: 'manifest_id' }),
    __metadata("design:type", shipment_entity_1.Shipment)
], Checkpoint.prototype, "shipment", void 0);
exports.Checkpoint = Checkpoint = __decorate([
    (0, typeorm_1.Entity)('checkpoints')
], Checkpoint);
//# sourceMappingURL=checkpoint.entity.js.map