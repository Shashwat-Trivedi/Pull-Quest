import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Use this import style for better type support

// --- 1. Check for the private key ---
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28", // I've used a specific version for consistency
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // viaIR is useful for complex contracts but can be removed if not needed
      viaIR: true, 
    },
  },
  networks: {
    hedera_testnet: {
      url: "https://testnet.hashio.io/api",
      // --- 2. Use the validated private key ---
      accounts: [privateKey],
      chainId: 296, // Hedera Testnet Chain ID
    },
    hedera_mainnet: {
      url: "https://mainnet.hashio.io/api",
      // --- 3. Use the same key for mainnet ---
      accounts: [privateKey],
      chainId: 295, // Hedera Mainnet Chain ID
    },
  },
};

export default config;
