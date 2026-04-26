import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, keccak256, toHex } from "viem";

describe("FuelDistribution", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [admin, station, distributor, depot] = await viem.getWalletClients();

  const STATION_ROLE = keccak256(toHex("STATION_ROLE"));
  const DISTRIBUTOR_ROLE = keccak256(toHex("DISTRIBUTOR_ROLE"));
  const DEPOT_ROLE = keccak256(toHex("DEPOT_ROLE"));
  const PRODUCT_PMS = keccak256(toHex("PMS"));

  async function deployContracts() {
    const mockStablecoin = await viem.deployContract("MockStablecoin");
    const fuelDistribution = await viem.deployContract("FuelDistribution", [
      mockStablecoin.address,
      admin.account.address,
    ]);

    return { mockStablecoin, fuelDistribution };
  }

  it("Should set up roles correctly", async function () {
    const { fuelDistribution } = await deployContracts();

    await fuelDistribution.write.grantRole([STATION_ROLE, station.account.address]);
    
    assert.equal(
      await fuelDistribution.read.hasRole([STATION_ROLE, station.account.address]),
      true
    );
  });

  it("Should create a manifest and lock funds", async function () {
    const { mockStablecoin, fuelDistribution } = await deployContracts();

    // Setup roles
    await fuelDistribution.write.grantRole([STATION_ROLE, station.account.address]);

    // Mint and approve tokens for station
    const amount = parseEther("1000"); // 1000 liters * 1 unit price
    await mockStablecoin.write.mint([station.account.address, amount]);
    
    // Station approves FuelDistribution
    const stationViem = await viem.getContractAt("MockStablecoin", mockStablecoin.address, { client: { wallet: station } });
    await stationViem.write.approve([fuelDistribution.address, amount]);

    // Create manifest
    const fuelDistStation = await viem.getContractAt("FuelDistribution", fuelDistribution.address, { client: { wallet: station } });
    
    await fuelDistStation.write.createManifest([
      PRODUCT_PMS,
      1000n, // volume
      parseEther("1"), // price per liter
      distributor.account.address,
      station.account.address,
      depot.account.address
    ]);

    assert.equal(await fuelDistribution.read.manifestCount(), 1n);
    assert.equal(await mockStablecoin.read.balanceOf([fuelDistribution.address]), amount);
  });

  it("Should confirm delivery and release funds", async function () {
    const { mockStablecoin, fuelDistribution } = await deployContracts();

    // Setup roles
    await fuelDistribution.write.grantRole([STATION_ROLE, station.account.address]);

    const volume = 1000n;
    const price = parseEther("1");
    const total = volume * price;

    await mockStablecoin.write.mint([station.account.address, total]);
    
    const stationStablecoin = await viem.getContractAt("MockStablecoin", mockStablecoin.address, { client: { wallet: station } });
    await stationStablecoin.write.approve([fuelDistribution.address, total]);

    const stationFuelDist = await viem.getContractAt("FuelDistribution", fuelDistribution.address, { client: { wallet: station } });
    
    await stationFuelDist.write.createManifest([
        PRODUCT_PMS,
        volume,
        price,
        distributor.account.address,
        station.account.address,
        depot.account.address
    ]);

    // Confirm delivery
    await stationFuelDist.write.confirmDelivery([1n]);

    const manifest = await fuelDistribution.read.manifests([1n]);
    assert.equal(manifest[8], 2); // Status.DELIVERED is 2

    assert.equal(await mockStablecoin.read.balanceOf([distributor.account.address]), total);
    assert.equal(await mockStablecoin.read.balanceOf([fuelDistribution.address]), 0n);
  });
});
