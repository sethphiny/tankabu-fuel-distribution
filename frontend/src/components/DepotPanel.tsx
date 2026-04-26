"use client";

import { useState } from "react";
import { PlusCircle, Info, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { FUEL_FLOW_ADDRESS, STABLECOIN_ADDRESS } from "@/lib/constants";
import FUEL_FLOW_ABI from "@/lib/abi.json";
import ERC20_ABI from "@/lib/erc20-abi.json";

const PRODUCT_TYPES = [
  { id: "PMS", name: "Premium Motor Spirit (PMS)" },
  { id: "AGO", name: "Automotive Gas Oil (AGO)" },
  { id: "DPK", name: "Dual Purpose Kerosene (DPK)" },
];

export default function DepotPanel() {
  const [loading, setLoading] = useState(false);
  const [stationAddr, setStationAddr] = useState("");
  const [driverAddr, setDriverAddr] = useState("");
  const [depotAddr, setDepotAddr] = useState("");
  const [volume, setVolume] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("1");
  const [productType, setProductType] = useState("PMS");

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) return alert("Please install MetaMask");

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const fuelFlow = new ethers.Contract(FUEL_FLOW_ADDRESS, FUEL_FLOW_ABI, signer);
      const stablecoin = new ethers.Contract(STABLECOIN_ADDRESS, ERC20_ABI, signer);

      const volumeNum = BigInt(volume);
      const priceWei = ethers.parseUnits(pricePerLiter, 18); // Assuming 18 decimals for stablecoin
      const totalPayment = volumeNum * priceWei;

      // 1. Approve FuelFlow to spend stablecoins
      console.log("Approving stablecoin for amount:", totalPayment.toString());
      const approveTx = await stablecoin.approve(FUEL_FLOW_ADDRESS, totalPayment);
      await approveTx.wait();

      // 2. Create Manifest
      console.log("Creating manifest...");
      const productTypeBytes = ethers.id(productType);
      
      const createTx = await fuelFlow.createManifest(
        productTypeBytes,
        volumeNum,
        priceWei,
        driverAddr,
        stationAddr,
        depotAddr || signer.address // use provided depot or signer as depot
      );
      await createTx.wait();

      alert("Manifest Created Successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Error: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Depot Dashboard</h2>
            <p className="text-gray-400 text-sm">Create and dispatch new fuel manifests</p>
          </div>
        </div>

        <form onSubmit={handleCreateManifest} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Type</label>
              <select 
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
              >
                {PRODUCT_TYPES.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fuel Volume (Liters)</label>
              <input 
                type="number" 
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="30000" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Price per Liter (USDC)</label>
              <input 
                type="number" 
                step="0.000001"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                placeholder="0.5" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Station Address</label>
              <input 
                type="text" 
                value={stationAddr}
                onChange={(e) => setStationAddr(e.target.value)}
                placeholder="0x..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Address</label>
              <input 
                type="text" 
                value={driverAddr}
                onChange={(e) => setDriverAddr(e.target.value)}
                placeholder="0x..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Depot Address (Optional)</label>
              <input 
                type="text" 
                value={depotAddr}
                onChange={(e) => setDepotAddr(e.target.value)}
                placeholder="0x... (defaults to you)" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-6 py-3.5 rounded-xl font-bold transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
            {loading ? "Processing..." : "Create & Dispatch Manifest"}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <p className="text-sm text-gray-300">
            Kwala will automatically notify the driver via Telegram once the manifest is confirmed on-chain.
          </p>
        </div>
      </div>
    </div>
  );
}
