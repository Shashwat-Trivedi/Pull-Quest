import express from "express";
import { ethers, JsonRpcProvider } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Enhanced logging utility
class TransferLogger {
  static info(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[TRANSFER-INFO] ${timestamp} - ${message}`);
    if (data) {
      console.log(`[TRANSFER-DATA] ${JSON.stringify(data, null, 2)}`);
    }
  }

  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[TRANSFER-ERROR] ${timestamp} - ${message}`);
    if (error) {
      console.error(`[TRANSFER-ERROR-DETAILS] ${error.stack || error.message || error}`);
    }
  }

  static transaction(action: string, txHash: string, details?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[TRANSFER-TX] ${timestamp} - ${action}`);
    console.log(`[TRANSFER-TX-HASH] ${txHash}`);
    if (details) {
      console.log(`[TRANSFER-TX-DETAILS] ${JSON.stringify(details, null, 2)}`);
    }
  }
}

// Provider setup
const provider = new JsonRpcProvider("https://testnet.hashio.io/api");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

TransferLogger.info("Transfer service initialized", {
  senderAddress: wallet.address
});

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

const hbarToWei = (hbarAmount: number) => {
  return ethers.parseEther(hbarAmount.toString());
};

async function getWalletBalance(address: string) {
  try {
    const balance = await provider.getBalance(address);
    const balanceInHbar = ethers.formatEther(balance);
    return balanceInHbar;
  } catch (error) {
    TransferLogger.error("Failed to get wallet balance", error);
    return "0";
  }
}

// ===================================================================
// TRANSFER FUNCTION
// ===================================================================

// Simple transfer function - sends HBAR to a specific address
router.post("/transfer/send", async (req: any, res: any) => {
  const requestId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { toAddress, amount, memo } = req.body;
    
    TransferLogger.info(`Transfer request initiated [${requestId}]`, {
      toAddress,
      amount,
      memo,
      fromAddress: wallet.address
    });

    // Validation
    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: "toAddress and amount are required",
        requestId
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
        requestId
      });
    }

    // Validate recipient address
    if (!ethers.isAddress(toAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient address",
        requestId
      });
    }

    const amountWei = hbarToWei(amount);
    const senderBalance = await getWalletBalance(wallet.address);

    TransferLogger.info(`Transfer validation passed [${requestId}]`, {
      toAddress,
      amountHbar: amount,
      amountWei: amountWei.toString(),
      senderBalance,
      memo: memo || "Direct transfer"
    });

    // Check sender balance
    if (parseFloat(senderBalance) < amount) {
      TransferLogger.error(`Insufficient balance [${requestId}]`, {
        required: amount,
        available: senderBalance
      });
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        required: amount,
        available: senderBalance,
        requestId
      });
    }

    // Execute transfer transaction
    TransferLogger.info(`Executing transfer [${requestId}]`, {
      from: wallet.address,
      to: toAddress,
      amount: amount
    });

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountWei,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits("420", "gwei")
    });

    TransferLogger.transaction(`Transfer submitted [${requestId}]`, tx.hash, {
      from: wallet.address,
      to: toAddress,
      value: amountWei.toString(),
      nonce: tx.nonce,
      gasLimit: tx.gasLimit?.toString(),
      gasPrice: tx.gasPrice?.toString()
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt) {
      TransferLogger.transaction(`Transfer confirmed [${requestId}]`, receipt.hash, {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status
      });
    }

    // Get updated balances
    const newSenderBalance = await getWalletBalance(wallet.address);
    const recipientBalance = await getWalletBalance(toAddress);

    const responseData = {
      success: true,
      message: "Transfer completed successfully",
      requestId,
      data: {
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber || null,
        from: wallet.address,
        to: toAddress,
        amountTransferred: amount,
        gasUsed: receipt?.gasUsed?.toString() || null,
        memo: memo || "Direct transfer",
        balances: {
          senderBefore: senderBalance,
          senderAfter: newSenderBalance,
          recipientAfter: recipientBalance
        }
      }
    };

    TransferLogger.info(`Transfer completed successfully [${requestId}]`, responseData);
    res.json(responseData);

  } catch (err: any) {
    TransferLogger.error(`Transfer failed [${requestId}]`, err);
    res.status(500).json({
      success: false,
      message: err.message || "Transfer failed",
      requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for transfer service
router.get("/transfer/health", async (req: any, res: any) => {
  try {
    const balance = await getWalletBalance(wallet.address);
    const network = await provider.getNetwork();
    
    const healthData = {
      success: true,
      timestamp: new Date().toISOString(),
      wallet: {
        address: wallet.address,
        balanceHBAR: balance
      },
      network: {
        name: network.name,
        chainId: network.chainId.toString()
      }
    };

    TransferLogger.info("Transfer service health check", healthData);
    res.json(healthData);

  } catch (error) {
    TransferLogger.error("Transfer health check failed", error);
    res.status(500).json({
      success: false,
      error: "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;