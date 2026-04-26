"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { FUEL_FLOW_ADDRESS } from "@/lib/constants";
import FUEL_FLOW_ABI from "@/lib/abi.json";

export default function StationPanel() {
  const [loading, setLoading] = useState(false);
  const [manifestId, setManifestId] = useState("");

  const handleConfirmDelivery = async () => {
    if (!manifestId) return alert("Please enter a Manifest ID");
    if (!window.ethereum) return alert("Please install MetaMask");

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const fuelFlow = new ethers.Contract(FUEL_FLOW_ADDRESS, FUEL_FLOW_ABI, signer);

      console.log("Confirming delivery...");
      const tx = await fuelFlow.confirmDelivery(manifestId);
      await tx.wait();

      alert("Delivery Confirmed! Payment released.");
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
        <div>
          <h2 className="text-2xl font-bold">Station Dashboard</h2>
          <p className="text-gray-400 text-sm">Monitor incoming fuel and confirm receipt</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Manifest ID</label>
            <input 
              type="number" 
              value={manifestId}
              onChange={(e) => setManifestId(e.target.value)}
              placeholder="e.g. 1" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
            />
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-xl group-hover:bg-blue-600 transition-all">
                <Clock className="w-6 h-6 text-blue-400 group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  Shipment {manifestId ? `#${manifestId}` : "Search"}
                  {manifestId && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-md border border-yellow-500/30 font-medium">
                      In Transit
                    </span>
                  )}
                </h4>
                <p className="text-gray-400 text-sm font-mono mt-1">
                  {manifestId ? "Waiting for your confirmation..." : "Enter ID above to start"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleConfirmDelivery}
              disabled={loading || !manifestId}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {loading ? "Processing..." : "Confirm Delivery"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
