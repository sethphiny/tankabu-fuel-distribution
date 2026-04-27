import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FuelDistributionModule = buildModule("FuelDistributionModule", (m) => {
  // Deploy MockStablecoin first (or use existing one if needed)
  const mockStablecoin = m.contract("MockStablecoin");

  // Get admin address (default to account 0)
  const admin = m.getAccount(0);

  // Deploy FuelDistributionV2 with stablecoin address and admin
  const fuelDistribution = m.contract("FuelDistributionV2", [
    mockStablecoin,
    admin,
  ]);

  return { mockStablecoin, fuelDistribution };
});

export default FuelDistributionModule;
