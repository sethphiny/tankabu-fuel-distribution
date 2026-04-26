"use client";

import { useState } from "react";
import { Fuel, Truck, MapPin, CheckCircle2, Droplets } from "lucide-react";
import DepotPanel from "@/components/DepotPanel";
import StationPanel from "@/components/StationPanel";

export default function Home() {
  const [activeView, setActiveView] = useState<"depot" | "station">("depot");
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not found");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/20">
              <Fuel className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">FuelFlow</h1>
              <p className="text-gray-400 text-sm">Autonomous Logistics Layer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveView("depot")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                  activeView === "depot"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Truck className="w-4 h-4" />
                Depot
              </button>
              <button
                onClick={() => setActiveView("station")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                  activeView === "station"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Station
              </button>
            </div>

            <button
              onClick={connectWallet}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {activeView === "depot" ? <DepotPanel /> : <StationPanel />}
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Network Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Chain</span>
                  <span className="font-mono">Base Sepolia</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Kwala Nodes</span>
                  <span className="text-green-500 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Automation</span>
                  <span className="text-blue-500 font-medium">Enabled</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl bg-blue-600/5 border-blue-500/20">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-blue-400">
                <Droplets className="w-5 h-5" />
                Gas Management
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Kwala is monitoring driver wallets to ensure zero downtime.
              </p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%]" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Threshold: 0.01 ETH</span>
                <span>Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
