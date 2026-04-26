# 🚀 Full Deployment Guide: From Zero to Automated Logistics

This guide covers everything you need to get the **FuelFlow** system live, from obtaining your first testnet tokens to deploying automated workflows on Kwala.

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
cp .env.example .env
```

| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `PRIVATE_KEY` | Your wallet's private key | Wallet -> Account Details -> Export |
| `BASESCAN_API_KEY` | For contract verification | [Basescan.org](https://basescan.org/) Dashboard |
| `TELEGRAM_BOT_TOKEN` | Your Bot's API token | [@BotFather](https://t.me/botfather) on Telegram |
| `TELEGRAM_CHAT_ID` | Your unique Chat ID | [@userinfobot](https://t.me/userinfobot) on Telegram |

---

## 3. Smart Contract Deployment

### Step 3.1: Deploy the Contracts
Run the following command to deploy the `FuelFlow` contract and the `MockStablecoin` to Base Sepolia:
```bash
pnpm deploy:sepolia
```
**Note:** Save the contract address returned in the terminal. You will need it for the next steps.

### Step 3.2: Verify the Contract (Crucial)
Verification allows Kwala and other tools to read your contract's ABI automatically.
```bash
pnpm verify:sepolia <YOUR_CONTRACT_ADDRESS> <STABLECOIN_ADDRESS>
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
    - Update `ContractAddress` with your deployed address.
    - Update `TELEGRAM_BOT_TOKEN` and `chat_id`.
5. **Gas Manager Workflow:** Paste contents of `kwala/gas-manager.yaml`.
    - Update `WalletAddress` with the Driver's address.
    - Update Telegram details.
6. Click **Deploy & Activate**.

---

## 6. Testing the Lifecycle
1. **Mint Tokens:** Use the `MockStablecoin` contract to mint tokens to your "Station" address.
2. **Create Manifest:** Call `createManifest` on the `FuelFlow` contract via the [Basescan Write Contract](https://sepolia.basescan.org/) tab or your frontend.
3. **Check Telegram:** Your bot should instantly send a dispatch notification.
4. **Confirm Delivery:** Call `confirmDelivery` as the Station.
5. **Verify Payment:** Check the Distributor's wallet for the released stablecoins.

---

## 🔍 Monitoring
- **Transactions:** [Base Sepolia Explorer](https://sepolia.basescan.org/)
- **Workflows:** [Kwala Explorer](https://Kwala-explorer.lovable.app/)
