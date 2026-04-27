import axios from 'axios';
import 'dotenv/config';

const API_URL = 'http://localhost:3000';
const API_KEY = process.env.BACKEND_API_KEY || 'hQ2pFjUZcsF6NFD6brEe65WzoVGZjuKeMlSyvEmcWQQ=';

async function testApi() {
  console.log('🚀 Starting Backend API Tests...');

  try {
    // 1. Test POST /api/shipments
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

    const postResponse = await axios.post(`${API_URL}/api/shipments`, newShipment, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('✅ POST Shipment Success:', postResponse.data);

    // 2. Test GET /api/shipments
    console.log('\n--- Test 2: GET /api/shipments ---');
    const getResponse = await axios.get(`${API_URL}/api/shipments`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`✅ GET Shipments Success: Found ${getResponse.data.length} shipments`);
    const lastShipment = getResponse.data[0];
    console.log('Latest shipment:', lastShipment);

    // 3. Test POST /api/checkpoints
    console.log('\n--- Test 3: POST /api/checkpoints ---');
    const newCheckpoint = {
      shipment_id: lastShipment.manifest_id,
      name: 'Milestone 1',
      location: 'Sagamu Interchange',
      status: 'VERIFIED',
      volume_recorded: 29950,
      variance: -0.16
    };

    const cpResponse = await axios.post(`${API_URL}/api/checkpoints`, newCheckpoint, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('✅ POST Checkpoint Success:', cpResponse.data);

    // 4. Test GET /api/checkpoints
    console.log('\n--- Test 2: GET /api/checkpoints ---');
    const cpGetResponse = await axios.get(`${API_URL}/api/checkpoints?shipmentId=${lastShipment.manifest_id}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`✅ GET Checkpoints Success: Found ${cpGetResponse.data.length} checkpoints`);
    console.log('Checkpoints:', cpGetResponse.data);

    console.log('\n✨ All tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test Failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

testApi();
