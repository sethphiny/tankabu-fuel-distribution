# 🛠️ Tankabu V2: End-to-End Setup Guide

This guide covers the deployment of the **FuelDistributionV2** ecosystem, including smart contracts, the standalone backend, and Kwala automation.

---

## 1. Prerequisites

- **Node.js v20+** and **pnpm**.
- **MetaMask** with BSC Testnet funds.
- **Kwala Account** for workflow activation.
- **Render Account** (for backend deployment).

---

## 2. Smart Contract Deployment

### Step 1: Configuration
Create a `.env` in the root:
```text
PRIVATE_KEY=your_wallet_private_key
```

### Step 2: Deploy to BSC Testnet
```bash
pnpm install
npx hardhat ignition deploy ignition/modules/FuelDistribution.ts --network bscTestnet --strategy basic --reset
```
*Note the deployed addresses for FuelDistributionV2 and MockStablecoin.*

---

## 3. Standalone Backend Setup

### Step 1: Initialize
```bash
cd backend
pnpm install
```

### Step 2: Environment
Create `backend/.env`:
```text
BACKEND_API_KEY=your_secure_key_here
PORT=3000
```

### Step 3: Run (Development)
```bash
pnpm dev
```

### Step 4: Deploy (Production)
Connect this repo to **Render**. It will automatically detect `render.yaml` and provision a Web Service with a Persistent Disk.

---

## 4. Kwala Workflow Activation

Activate the following YAMLs in the Kwala dashboard:

1. **`kwala/manifest_notifier.yaml`**:
   - Updates the SQL DB and notifies the driver via Telegram.
2. **`kwala/dispatcher.yaml`**:
   - Synchronizes checkpoint validations and alerts on anomalies.
3. **`kwala/gas-manager.yaml`**:
   - Monitors operational liquidity for drivers.

*Ensure the `APIHeaders.x-api-key` in the YAMLs matches your `BACKEND_API_KEY`.*

---

## 5. Telegram Notifier Setup

Tankabu uses Telegram to notify drivers of new dispatches and alert operators to anomalies. Follow these steps to set up your notification channel:

### Step 1: Create a Telegram Bot
1. Open Telegram and search for **@BotFather**.
2. Send `/newbot` and follow the instructions to name your bot.
3. **Save the API Token** provided (it looks like `123456789:ABCDefgh...`).

### Step 2: Get your Chat ID
1. Search for **@userinfobot** in Telegram.
2. Send any message to it, and it will reply with your `Id` (e.g., `307092268`).
3. Alternatively, add your new bot to a group and use a tool like `@get_id_bot` to get the Group Chat ID.

### Step 3: Update Kwala Workflows
Open the following files in the `kwala/` directory and replace the placeholder values:

- `kwala/manifest_notifier.yaml`
- `kwala/dispatcher.yaml`
- `kwala/gas-manager.yaml`

**Replace these fields:**
1. `APIEndpoint`: Update the token in the URL: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`
2. `chat_id`: Replace `"307092268"` with your actual Chat ID.

---

## 6. Frontend Integration (Tankabu)

Update `tankabu/src/lib/constants.ts` with your new deployment data:

```typescript
export const FUEL_DISTRIBUTION_ADDRESS = "0x..."; // Your V2 Address
export const MOCK_STABLECOIN_ADDRESS = "0x...";     // Your Mock Token Address
export const BACKEND_API_URL = "https://your-render-app.onrender.com";
export const BACKEND_API_KEY = "your_secure_key_here";
```

---

## 🚀 System Verification

1. **Dispatch**: Create a manifest via **Dispatch Central**. Verify it appears in the SQL DB.
2. **Track**: Initialize the **Driver Terminal** with the Manifest ID.
3. **Validate**: Submit a checkpoint validation. Check the **Operator Dashboard** for the updated map marker and **Telegram** for the sync alert.

---

## 🆘 Troubleshooting

- **Contract Error**: Ensure you have enough BNB for gas and that the `STATION_ROLE` is granted.
- **Sync Failure**: Verify that your backend URL is public (use Ngrok for local testing) so Kwala can reach the endpoint.
- **API Unauthorized**: Check that the `x-api-key` header matches exactly across Kwala, Backend, and Frontend.
