# 🚀 Full Deployment Guide: From Zero to Automated Logistics

This guide covers everything you need to get the **FuelFlow** (Fuel Distribution Tracker) system live, from obtaining your first testnet tokens to deploying automated workflows on Kwala.

---

## 1. Prerequisites & Wallet Setup
Before you begin, ensure you have:
- **Metamask** installed.
- **Base Sepolia** network added.
- **Testnet ETH:** Get some from the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet).
- **pnpm** installed globally.

---

## 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
PRIVATE_KEY=your_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_id
```

| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `PRIVATE_KEY` | Your wallet's private key | Wallet -> Account Details -> Export |
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia RPC URL | [Base Docs](https://docs.base.org/network-information) or Infura/Alchemy |
| `BASESCAN_API_KEY` | For contract verification | [Basescan.org](https://basescan.org/) Dashboard |
| `TELEGRAM_BOT_TOKEN` | Your Bot's API token | [@BotFather](https://t.me/botfather) on Telegram |
| `TELEGRAM_CHAT_ID` | Your unique Chat ID | [@userinfobot](https://t.me/userinfobot) on Telegram |

---

## 3. Smart Contract Deployment

### Step 3.1: Deploy the Contracts
Run the following command to deploy the `FuelDistribution` contract and the `MockStablecoin` to your preferred network:

**Base Sepolia:**
```bash
pnpm run deploy:base-sepolia
```

**BSC Testnet:**
```bash
pnpm run deploy:bsc-testnet
```

**Note:** Save the contract addresses returned in the terminal. Ignition will also save them in `ignition/deployments/chain-<chainId>/deployed_addresses.json`.

### Step 3.2: Verify the Contracts (Crucial)
Verification allows Kwala and other tools to read your contract's ABI automatically.

**Base Sepolia:**
```bash
pnpm run verify:base-sepolia <FUEL_DISTRIBUTION_ADDRESS> <STABLECOIN_ADDRESS> <ADMIN_ADDRESS>
```

**BSC Testnet:**
```bash
pnpm run verify:bsc-testnet <FUEL_DISTRIBUTION_ADDRESS> <STABLECOIN_ADDRESS> <ADMIN_ADDRESS>
```

---

## 4. Get Kwala Credits
Kwala workflows require credits to execute triggers.
1. Visit [payments.kwala.network](https://payments.kwala.network/).
2. Connect your wallet (on **BNB Smart Chain**).
3. Swap a small amount of **USDT** for Kwala Credits.
4. Your credits will be linked to your wallet address.

---

## 5. Deploying Kwala Workflows
1. Log in to the [Kwala Dashboard](https://kwala.network/dashboard).
2. Go to **Workflows** -> **+ Create Workflow**.
3. Select **Import YAML**.
4. **Dispatcher Workflow:** Paste contents of `kwala/dispatcher.yaml`.
    - Note: I have already injected your contract addresses and Telegram credentials into the YAML file for you.
5. **Gas Manager Workflow:** Paste contents of `kwala/gas-manager.yaml`.
    - Note: Just update the `TriggerWalletAddress` with the Driver's address if needed.
6. Click **Deploy & Activate**.

---

## 6. Testing the Lifecycle
1. **Mint Tokens:** Use the `MockStablecoin` contract to mint tokens to your "Station" address.
2. **Setup Roles:** Grant `STATION_ROLE` to your station address via the `FuelDistribution` contract.
3. **Create Manifest:** Call `createManifest` on the `FuelDistribution` contract via the [Basescan Write Contract](https://sepolia.basescan.org/) tab or your frontend.
4. **Check Telegram:** Your bot should instantly send a dispatch notification.
5. **Confirm Delivery:** Call `confirmDelivery` as the Station.
6. **Verify Payment:** Check the Distributor's wallet for the released stablecoins.

---

## 🔍 Monitoring
- **Transactions:** [Base Sepolia Explorer](https://sepolia.basescan.org/)
- **Workflows:** [Kwala Explorer](https://explorer.kwala.network/)
