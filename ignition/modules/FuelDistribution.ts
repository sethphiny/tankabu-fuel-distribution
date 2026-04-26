import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FuelDistributionModule = buildModule("FuelDistributionModule", (m) => {
  // Deploy MockStablecoin first
  const mockStablecoin = m.contract("MockStablecoin");

  // Get admin address (default to account 0)
  const admin = m.getAccount(0);

  // Deploy FuelDistribution with stablecoin address and admin
  const fuelDistribution = m.contract("FuelDistribution", [
    mockStablecoin,
    admin,
  ]);

  return { mockStablecoin, fuelDistribution };
});

export default FuelDistributionModule;
