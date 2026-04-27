"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const API_URL = 'http://localhost:3000';
const API_KEY = process.env.BACKEND_API_KEY || 'hQ2pFjUZcsF6NFD6brEe65WzoVGZjuKeMlSyvEmcWQQ=';
async function testApi() {
    console.log('🚀 Starting Backend API Tests...');
    try {
        console.log('\n--- Test 1: POST /api/shipments ---');
        const newShipment = {
            manifest_id: `TEST-${Math.floor(Math.random() * 10000)}`,
            product_type: 'PMS',
            volume: 30000,
            price: 1.5,
            station_address: '0xTestStationAddress',
            driver_address: '0xTestDriverAddress',
            planned_route: ['Depot A', 'Milestone 1', 'Terminal B']
        };
        const postResponse = await axios_1.default.post(`${API_URL}/api/shipments`, newShipment, {
            headers: { 'x-api-key': API_KEY }
        });
        console.log('✅ POST Shipment Success:', postResponse.data);
        console.log('\n--- Test 2: GET /api/shipments ---');
        const getResponse = await axios_1.default.get(`${API_URL}/api/shipments`, {
            headers: { 'x-api-key': API_KEY }
        });
        console.log(`✅ GET Shipments Success: Found ${getResponse.data.length} shipments`);
        const lastShipment = getResponse.data[0];
        console.log('Latest shipment:', lastShipment);
        console.log('\n--- Test 3: POST /api/checkpoints ---');
        const newCheckpoint = {
            shipment_id: lastShipment.manifest_id,
            name: 'Milestone 1',
            location: 'Sagamu Interchange',
            status: 'VERIFIED',
            volume_recorded: 29950,
            variance: -0.16
        };
        const cpResponse = await axios_1.default.post(`${API_URL}/api/checkpoints`, newCheckpoint, {
            headers: { 'x-api-key': API_KEY }
        });
        console.log('✅ POST Checkpoint Success:', cpResponse.data);
        console.log('\n--- Test 2: GET /api/checkpoints ---');
        const cpGetResponse = await axios_1.default.get(`${API_URL}/api/checkpoints?shipmentId=${lastShipment.manifest_id}`, {
            headers: { 'x-api-key': API_KEY }
        });
        console.log(`✅ GET Checkpoints Success: Found ${cpGetResponse.data.length} checkpoints`);
        console.log('Checkpoints:', cpGetResponse.data);
        console.log('\n✨ All tests passed successfully!');
    }
    catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        }
        else {
            console.error('Message:', error.message);
        }
        process.exit(1);
    }
}
testApi();
//# sourceMappingURL=test_api.js.map