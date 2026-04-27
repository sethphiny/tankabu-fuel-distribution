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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shipment_schema_1 = require("../database/schemas/shipment.schema");
const checkpoint_schema_1 = require("../database/schemas/checkpoint.schema");
let ShipmentsService = class ShipmentsService {
    constructor(shipmentsRepository, checkpointsRepository, dataSource) {
        this.shipmentsRepository = shipmentsRepository;
        this.checkpointsRepository = checkpointsRepository;
        this.dataSource = dataSource;
    }
    async findAllShipments() {
        return this.shipmentsRepository.find({
            order: { created_at: 'DESC' },
        });
    }
    async createShipment(data) {
        const { manifest_id, product_type, volume, price, station_address, driver_address, planned_route } = data;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const shipment = this.shipmentsRepository.create({
                manifest_id, product_type, volume, price, station_address, driver_address
            });
            const savedShipment = await queryRunner.manager.save(shipment);
            if (planned_route && Array.isArray(planned_route)) {
                const checkpoints = planned_route.map(stopName => this.checkpointsRepository.create({
                    shipment_id: manifest_id,
                    name: stopName,
                    location: stopName,
                    status: 'PENDING',
                    volume_recorded: 0,
                    variance: 0
                }));
                await queryRunner.manager.save(checkpoints);
            }
            await queryRunner.commitTransaction();
            return { id: savedShipment.id, ...data };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException(err.message);
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateShipmentStatus(manifestId, status) {
        const result = await this.shipmentsRepository.update({ manifest_id: manifestId }, { status });
        return { success: true, updated: result.affected };
    }
    async findCheckpoints(shipmentId) {
        return this.checkpointsRepository.find({
            where: { shipment_id: shipmentId },
            order: { timestamp: 'ASC' },
        });
    }
    async upsertCheckpoint(data) {
        const { shipment_id, name, location, status, volume_recorded, variance } = data;
        const existing = await this.checkpointsRepository.findOne({
            where: { shipment_id, name, status: 'PENDING' }
        });
        if (existing) {
            existing.location = location;
            existing.status = status;
            existing.volume_recorded = volume_recorded;
            existing.variance = variance;
            existing.timestamp = new Date();
            const saved = await this.checkpointsRepository.save(existing);
            return { id: saved.id, ...data, updated: true };
        }
        else {
            const checkpoint = this.checkpointsRepository.create({
                shipment_id, name, location, status, volume_recorded, variance
            });
            const saved = await this.checkpointsRepository.save(checkpoint);
            return { id: saved.id, ...data, updated: false };
        }
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipment_schema_1.Shipment)),
    __param(1, (0, typeorm_1.InjectRepository)(checkpoint_schema_1.Checkpoint)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map