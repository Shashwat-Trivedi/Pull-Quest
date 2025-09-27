import express from "express";
import { ethers, JsonRpcProvider } from "ethers";
import { 
  Client, 
  TopicMessageSubmitTransaction, 
  PrivateKey, 
  TopicMessageQuery,
  Hbar
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Provider and contract setup
const provider = new JsonRpcProvider("https://testnet.hashio.io/api");
const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS as string;

// Cleaned up ABI - removed duplicates
const stakingAbi = [
  // Staking functions
  "function stakeOnIssue(string memory _githubUsername, string memory _repository, uint256 _issueNumber, uint256 _amount) external payable",
  "function getStake(uint256 _stakeId) external view returns (string memory githubUsername, string memory repository, uint256 issueNumber, uint256 amount, uint256 timestamp, address staker, bool isActive)",
  "function getUserTotalStaked(string memory _githubUsername) external view returns (uint256)",
  "function getUserStakeIds(string memory _githubUsername) external view returns (uint256[] memory)",
  "function getIssueStakeTotal(string memory _repository, uint256 _issueNumber) external view returns (uint256)",
  "function withdrawStake(uint256 _stakeId) external",
  "function nextStakeId() external view returns (uint256)",
  "function getTotalValueLocked() external view returns (uint256)",
  "function getActiveStakesCount() external view returns (uint256)",
  "function batchStakeOnIssue(string[] memory _githubUsernames, string[] memory _repositories, uint256[] memory _issueNumbers, uint256[] memory _amounts) external payable",
  
  // XP functions
  "function addXp(string memory _githubUsername, uint256 _prNumber, uint256 _xpPoints, string memory _message) external",
  "function getUserTotalXp(string memory _githubUsername) external view returns (uint256)",
  "function getUserXpLogs(string memory _githubUsername) external view returns (tuple(string githubUsername, uint256 prNumber, uint256 xpPoints, uint256 timestamp)[])",
  
  // Events
  "event StakeCreated(uint256 indexed stakeId, string indexed githubUsername, string repository, uint256 indexed issueNumber, uint256 amount, address staker, uint256 timestamp)",
  "event StakeWithdrawn(uint256 indexed stakeId, string indexed githubUsername, address withdrawer, uint256 amount)",
  "event XpAdded(string indexed githubUsername, uint256 indexed prNumber, uint256 xpPoints, uint256 timestamp, string message)"
];

// Initialize wallet and contract
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
const stakingContract = new ethers.Contract(stakingContractAddress, stakingAbi, wallet);

// Initialize Hedera client
const hederaClient = Client.forTestnet();
if (process.env.HEDERA_ACCOUNT_ID && process.env.PRIVATE_KEY) {
  hederaClient.setOperator(
    process.env.HEDERA_ACCOUNT_ID,
    PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
  );
}

// ===================================================================
// HCS-2 UTILITY FUNCTIONS
// ===================================================================

interface StakeData {
  stakeId?: string;
  githubUsername: string;
  repository: string;
  issueNumber: number;
  stakeAmount: number;
  txHash?: string;
  timestamp: string;
  walletAddress?: string;
  action: 'create' | 'withdraw' | 'update';
}

interface XpData {
  githubUsername: string;
  prNumber: number;
  xpPoints: number;
  message: string;
  txHash?: string;
  timestamp: string;
  walletAddress?: string;
  action: 'add_xp';
}

/**
 * Publishes stake data to HCS using HCS-2 standard
 */
async function publishStakeToHCS2(stakeData: StakeData): Promise<{
  success: boolean;
  sequenceNumber?: number;
  transactionId?: string;
  error?: string;
}> {
  try {
    if (!process.env.HCS_TOPIC_ID) {
      throw new Error("HCS_TOPIC_ID not configured");
    }

    const hcs2Message = {
      p: "hcs-2",
      op: "register",
      t_id: process.env.HCS_TOPIC_ID,
      metadata: JSON.stringify({
        type: "github_issue_stake",
        version: "1.0",
        data: stakeData
      }),
      m: `${stakeData.action}: ${stakeData.githubUsername}/${stakeData.repository}#${stakeData.issueNumber} - ${stakeData.stakeAmount} HBAR`
    };

    console.log("Publishing to HCS-2:", hcs2Message);

    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(process.env.HCS_TOPIC_ID)
      .setMessage(JSON.stringify(hcs2Message))
      .setMaxTransactionFee(new Hbar(2));

    const response = await transaction.execute(hederaClient);
    const receipt = await response.getReceipt(hederaClient);
    
    console.log("HCS-2 publication successful:", {
      status: receipt.status.toString(),
      transactionId: response.transactionId?.toString()
    });

    return {
      success: true,
      sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
      transactionId: response.transactionId?.toString()
    };

  } catch (error: any) {
    console.error("HCS-2 publication failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Publishes XP data to HCS using HCS-2 standard
 */
async function publishXpToHCS2(xpData: XpData): Promise<{
  success: boolean;
  sequenceNumber?: number;
  transactionId?: string;
  error?: string;
}> {
  try {
    if (!process.env.HCS_TOPIC_ID) {
      throw new Error("HCS_TOPIC_ID not configured");
    }

    const hcs2Message = {
      p: "hcs-2",
      op: "register",
      t_id: process.env.HCS_TOPIC_ID,
      metadata: JSON.stringify({
        type: "github_pr_xp",
        version: "1.0",
        data: xpData
      }),
      m: `${xpData.action}: ${xpData.githubUsername} earned ${xpData.xpPoints} XP on PR #${xpData.prNumber} - ${xpData.message}`
    };

    console.log("Publishing XP to HCS-2:", hcs2Message);

    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(process.env.HCS_TOPIC_ID)
      .setMessage(JSON.stringify(hcs2Message))
      .setMaxTransactionFee(new Hbar(2));

    const response = await transaction.execute(hederaClient);
    const receipt = await response.getReceipt(hederaClient);
    
    console.log("HCS-2 XP publication successful:", {
      status: receipt.status.toString(),
      transactionId: response.transactionId?.toString()
    });

    return {
      success: true,
      sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
      transactionId: response.transactionId?.toString()
    };

  } catch (error: any) {
    console.error("HCS-2 XP publication failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retrieves all stakes from HCS topic
 */
async function getAllStakesFromHCS(): Promise<StakeData[]> {
  try {
    if (!process.env.HCS_TOPIC_ID) {
      throw new Error("HCS_TOPIC_ID not configured");
    }

    const stakes: StakeData[] = [];
    
    const query = new TopicMessageQuery()
      .setTopicId(process.env.HCS_TOPIC_ID)
      .setStartTime(0);

    return new Promise((resolve, reject) => {
      const subscription = query.subscribe(hederaClient, null, (message) => {
        try {
          const messageString = Buffer.from(message.contents).toString();
          const hcs2Data = JSON.parse(messageString);
          
          if (hcs2Data.p === "hcs-2" && hcs2Data.op === "register" && hcs2Data.metadata) {
            const metadata = JSON.parse(hcs2Data.metadata);
            if (metadata.type === "github_issue_stake" && metadata.data) {
              stakes.push(metadata.data);
            }
          }
        } catch (error) {
          console.error("Error parsing HCS message:", error);
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve(stakes);
      }, 5000);
    });

  } catch (error: any) {
    console.error("Error retrieving stakes from HCS:", error);
    return [];
  }
}

/**
 * Retrieves all XP records from HCS topic
 */
async function getAllXpFromHCS(): Promise<XpData[]> {
  try {
    if (!process.env.HCS_TOPIC_ID) {
      throw new Error("HCS_TOPIC_ID not configured");
    }

    const xpRecords: XpData[] = [];
    
    const query = new TopicMessageQuery()
      .setTopicId(process.env.HCS_TOPIC_ID)
      .setStartTime(0);

    return new Promise((resolve, reject) => {
      const subscription = query.subscribe(hederaClient, null, (message) => {
        try {
          const messageString = Buffer.from(message.contents).toString();
          const hcs2Data = JSON.parse(messageString);
          
          if (hcs2Data.p === "hcs-2" && hcs2Data.op === "register" && hcs2Data.metadata) {
            const metadata = JSON.parse(hcs2Data.metadata);
            if (metadata.type === "github_pr_xp" && metadata.data) {
              xpRecords.push(metadata.data);
            }
          }
        } catch (error) {
          console.error("Error parsing HCS XP message:", error);
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve(xpRecords);
      }, 5000);
    });

  } catch (error: any) {
    console.error("Error retrieving XP from HCS:", error);
    return [];
  }
}

/**
 * Gets stakes for a specific GitHub user from HCS
 */
async function getUserStakesFromHCS(githubUsername: string): Promise<StakeData[]> {
  const allStakes = await getAllStakesFromHCS();
  return allStakes.filter(stake => 
    stake.githubUsername.toLowerCase() === githubUsername.toLowerCase()
  );
}

/**
 * Gets XP records for a specific GitHub user from HCS
 */
async function getUserXpFromHCS(githubUsername: string): Promise<XpData[]> {
  const allXp = await getAllXpFromHCS();
  return allXp.filter(xp => 
    xp.githubUsername.toLowerCase() === githubUsername.toLowerCase()
  );
}

/**
 * Gets stakes for a specific repository/issue from HCS
 */
async function getIssueStakesFromHCS(repository: string, issueNumber: number): Promise<StakeData[]> {
  const allStakes = await getAllStakesFromHCS();
  return allStakes.filter(stake => 
    stake.repository.toLowerCase() === repository.toLowerCase() && 
    stake.issueNumber === issueNumber
  );
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

const hbarToWei = (hbarAmount: number) => {
  return ethers.parseEther(hbarAmount.toString());
};

async function checkProviderHealth() {
  try {
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
    return true;
  } catch (error) {
    console.error("Provider health check failed:", error);
    return false;
  }
}

// ===================================================================
// ROUTES
// ===================================================================

// Health check route
router.get("/health", async (req, res) => {
  try {
    const providerHealthy = await checkProviderHealth();
    const stakingContractAddr = stakingContractAddress;
    const hcsStakeConfigured = !!process.env.HCS_TOPIC_ID;
    const hcsXpConfigured = !!process.env.HCS_TOPIC_ID;
    
    // Test contract connectivity
    let contractTestResult = "Unknown";
    try {
      await stakingContract.getAddress();
      contractTestResult = "Connected";
    } catch (error) {
      contractTestResult = "Failed";
    }
    
    res.json({
      success: true,
      provider: providerHealthy ? "Connected" : "Failed",
      contract: stakingContractAddr,
      contractTest: contractTestResult,
      hcs: {
        stake: hcsStakeConfigured ? "Configured" : "Not configured",
        xp: hcsXpConfigured ? "Configured" : "Not configured"
      },
      hcsTopicIds: {
        stake: process.env.HCS_TOPIC_ID,
        xp: process.env.HCS_TOPIC_ID
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Health check failed"
    });
  }
});

// XP Addition route with HCS-2 integration and improved error handling
router.post("/add-xp", async (req, res) => {
  try {
    const { 
      githubUsername, 
      prNumber, 
      xpPoints, 
      message = "XP awarded for contribution" 
    } = req.body;

    // Validation
    if (!githubUsername || !prNumber || !xpPoints) {
      return res.status(400).json({
        success: false,
        message: "githubUsername, prNumber, and xpPoints are required"
      });
    }

    if (xpPoints <= 0) {
      return res.status(400).json({
        success: false,
        message: "XP points must be greater than 0"
      });
    }

    console.log(`Adding XP: ${githubUsername} earning ${xpPoints} XP on PR #${prNumber}`);

    // Check provider health
    const providerHealthy = await checkProviderHealth();
    if (!providerHealthy) {
      throw new Error("Provider connection failed - please try again");
    }

    // Execute blockchain transaction
    let tx;
    let retries = 3;
    
    while (retries > 0) {
      try {
        tx = await stakingContract.addXp(
          githubUsername,
          prNumber,
          xpPoints,
          message,
          {
            gasLimit: 300000,
            gasPrice: ethers.parseUnits("420", "gwei")
          }
        );
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`XP transaction failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const receipt = await tx.wait();
    console.log("XP transaction confirmed:", receipt.hash);

    // Prepare XP data for HCS
    const xpData: XpData = {
      githubUsername,
      prNumber,
      xpPoints,
      message,
      txHash: tx.hash,
      timestamp: new Date().toISOString(),
      walletAddress: wallet.address,
      action: 'add_xp'
    };

    // Publish to HCS-2
    const hcsResult = await publishXpToHCS2(xpData);

    // Try to get user's total XP with error handling
    let totalXp = "0";
    let totalXpSource = "unavailable";
    let totalXpError: string | undefined;

    try {
      const contractTotalXp = await stakingContract.getUserTotalXp(githubUsername);
      totalXp = contractTotalXp.toString();
      totalXpSource = "contract";
      console.log("Successfully got total XP from contract:", totalXp);
    } catch (contractError: any) {
      console.log("Contract getUserTotalXp failed, trying HCS fallback:", contractError.message);
      
      try {
        // Fallback to HCS data
        const xpRecords = await getUserXpFromHCS(githubUsername);
        totalXp = xpRecords.reduce((sum, record) => sum + record.xpPoints, 0).toString();
        totalXpSource = "hcs";
        console.log("Successfully got total XP from HCS:", totalXp);
      } catch (hcsError: any) {
        console.log("HCS fallback also failed:", hcsError.message);
        totalXpError = `Contract: ${contractError.message}; HCS: ${hcsError.message}`;
      }
    }

    res.json({
      success: true,
      message: "XP added and recorded on HCS successfully",
      data: {
        githubUsername,
        prNumber,
        xpPoints,
        message,
        txHash: tx.hash,
        walletAddress: wallet.address,
        totalXp,
        totalXpSource,
        totalXpError,
        hcs: {
          success: hcsResult.success,
          sequenceNumber: hcsResult.sequenceNumber,
          transactionId: hcsResult.transactionId,
          error: hcsResult.error
        }
      }
    });

  } catch (err: any) {
    console.error("Error adding XP:", err);
    res.status(500).json({
      success: false,
      message: err.message || "XP addition failed"
    });
  }
});

// Get user XP with fallback handling
router.get("/xp/user/:githubUsername", async (req, res) => {
  try {
    const { githubUsername } = req.params;
    
    let response: any = {
      success: true,
      message: `XP data for ${githubUsername} retrieved successfully`,
      data: {
        githubUsername,
        source: 'unknown'
      }
    };

    try {
      // Try contract first
      const totalXp = await stakingContract.getUserTotalXp(githubUsername);
      const xpLogs = await stakingContract.getUserXpLogs(githubUsername);
      
      response.data = {
        ...response.data,
        totalXp: totalXp.toString(),
        source: 'contract',
        xpLogs: xpLogs.map((log: any) => ({
          githubUsername: log.githubUsername,
          prNumber: log.prNumber.toString(),
          xpPoints: log.xpPoints.toString(),
          timestamp: new Date(Number(log.timestamp) * 1000).toISOString()
        }))
      };
    } catch (contractError: any) {
      console.log("Contract failed, using HCS fallback:", contractError.message);
      
      // Fallback to HCS
      const xpRecords = await getUserXpFromHCS(githubUsername);
      const totalXp = xpRecords.reduce((sum, record) => sum + record.xpPoints, 0);
      
      response.data = {
        ...response.data,
        totalXp: totalXp.toString(),
        source: 'hcs',
        xpLogs: xpRecords.map(record => ({
          githubUsername: record.githubUsername,
          prNumber: record.prNumber.toString(),
          xpPoints: record.xpPoints.toString(),
          timestamp: record.timestamp
        })),
        contractError: contractError.message
      };
    }

    res.json(response);

  } catch (err: any) {
    console.error("Error retrieving user XP:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve user XP"
    });
  }
});

// Get user XP from HCS
router.get("/xp/hcs/user/:githubUsername", async (req, res) => {
  try {
    const { githubUsername } = req.params;
    const xpRecords = await getUserXpFromHCS(githubUsername);
    
    const totalXp = xpRecords.reduce((sum, record) => sum + record.xpPoints, 0);
    
    res.json({
      success: true,
      message: `XP records for ${githubUsername} retrieved from HCS successfully`,
      data: {
        githubUsername,
        xpRecords,
        count: xpRecords.length,
        totalXp
      }
    });

  } catch (err: any) {
    console.error("Error retrieving user XP from HCS:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve user XP from HCS"
    });
  }
});

// Get all XP records from HCS
router.get("/xp/hcs", async (req, res) => {
  try {
    const xpRecords = await getAllXpFromHCS();
    
    res.json({
      success: true,
      message: "All XP records retrieved from HCS successfully",
      data: {
        xpRecords,
        count: xpRecords.length
      }
    });

  } catch (err: any) {
    console.error("Error retrieving all XP from HCS:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve XP records from HCS"
    });
  }
});

// Main staking route with HCS-2 integration
router.post("/stake", async (req, res) => {
  try {
    const { 
      githubUsername, 
      repository, 
      issueNumber, 
      stakeAmount 
    } = req.body;

    // Validation
    if (!githubUsername || !repository || !issueNumber || !stakeAmount) {
      return res.status(400).json({
        success: false,
        message: "githubUsername, repository, issueNumber, and stakeAmount are required"
      });
    }

    if (stakeAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Stake amount must be greater than 0"
      });
    }

    const stakeAmountWei = hbarToWei(stakeAmount);

    console.log(`Creating stake: ${githubUsername} staking ${stakeAmount} HBAR on ${repository}#${issueNumber}`);

    // Check provider health
    const providerHealthy = await checkProviderHealth();
    if (!providerHealthy) {
      throw new Error("Provider connection failed - please try again");
    }

    // Execute blockchain transaction
    let tx;
    let retries = 3;
    
    while (retries > 0) {
      try {
        tx = await stakingContract.stakeOnIssue(
          githubUsername,
          repository,
          issueNumber,
          stakeAmountWei,
          {
            value: stakeAmountWei,
            gasLimit: 500000,
            gasPrice: ethers.parseUnits("420", "gwei")
          }
        );
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Transaction failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const receipt = await tx.wait();
    console.log("Stake transaction confirmed:", receipt.hash);

    // Extract stake ID from event logs
    const stakeCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = stakingContract.interface.parseLog(log);
        return parsed?.name === 'StakeCreated';
      } catch {
        return false;
      }
    });

    let stakeId = null;
    if (stakeCreatedEvent) {
      const parsed = stakingContract.interface.parseLog(stakeCreatedEvent);
      stakeId = parsed?.args[0]?.toString();
    }

    // Prepare stake data for HCS
    const stakeData: StakeData = {
      stakeId: stakeId || undefined,
      githubUsername,
      repository,
      issueNumber,
      stakeAmount,
      txHash: tx.hash,
      timestamp: new Date().toISOString(),
      walletAddress: wallet.address,
      action: 'create'
    };

    // Publish to HCS-2
    const hcsResult = await publishStakeToHCS2(stakeData);

    res.json({
      success: true,
      message: "Stake created and recorded on HCS successfully",
      data: {
        stakeId,
        githubUsername,
        repository,
        issueNumber,
        stakeAmount,
        txHash: tx.hash,
        walletAddress: wallet.address,
        hcs: {
          success: hcsResult.success,
          sequenceNumber: hcsResult.sequenceNumber,
          transactionId: hcsResult.transactionId,
          error: hcsResult.error
        }
      }
    });

  } catch (err: any) {
    console.error("Error creating stake:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Staking failed"
    });
  }
});

// Withdraw stake route with HCS recording
router.post("/withdraw/:stakeId", async (req, res) => {
  try {
    const { stakeId } = req.params;
    
    if (!stakeId) {
      return res.status(400).json({
        success: false,
        message: "Stake ID is required"
      });
    }

    console.log(`Withdrawing stake: ${stakeId}`);

    // Get stake details before withdrawal
    const stakeDetails = await stakingContract.getStake(stakeId);
    
    // Execute withdrawal
    const tx = await stakingContract.withdrawStake(stakeId, {
      gasLimit: 300000,
      gasPrice: ethers.parseUnits("420", "gwei")
    });

    const receipt = await tx.wait();
    console.log("Withdrawal transaction confirmed:", receipt.hash);

    // Record withdrawal on HCS
    const withdrawalData: StakeData = {
      stakeId,
      githubUsername: stakeDetails.githubUsername,
      repository: stakeDetails.repository,
      issueNumber: Number(stakeDetails.issueNumber),
      stakeAmount: Number(ethers.formatEther(stakeDetails.amount)),
      txHash: tx.hash,
      timestamp: new Date().toISOString(),
      walletAddress: wallet.address,
      action: 'withdraw'
    };

    const hcsResult = await publishStakeToHCS2(withdrawalData);

    res.json({
      success: true,
      message: "Stake withdrawn and recorded on HCS successfully",
      data: {
        stakeId,
        txHash: tx.hash,
        hcs: {
          success: hcsResult.success,
          sequenceNumber: hcsResult.sequenceNumber,
          transactionId: hcsResult.transactionId,
          error: hcsResult.error
        }
      }
    });

  } catch (err: any) {
    console.error("Error withdrawing stake:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Withdrawal failed"
    });
  }
});

// Get all stakes from HCS
router.get("/stakes/hcs", async (req, res) => {
  try {
    const stakes = await getAllStakesFromHCS();
    
    res.json({
      success: true,
      message: "Stakes retrieved from HCS successfully",
      data: {
        stakes,
        count: stakes.length
      }
    });

  } catch (err: any) {
    console.error("Error retrieving stakes from HCS:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve stakes from HCS"
    });
  }
});

// Get user stakes from HCS
router.get("/stakes/user/:githubUsername", async (req, res) => {
  try {
    const { githubUsername } = req.params;
    const stakes = await getUserStakesFromHCS(githubUsername);
    
    res.json({
      success: true,
      message: `Stakes for ${githubUsername} retrieved from HCS successfully`,
      data: {
        githubUsername,
        stakes,
        count: stakes.length,
        totalStaked: stakes
          .filter(s => s.action === 'create')
          .reduce((sum, stake) => sum + stake.stakeAmount, 0)
      }
    });

  } catch (err: any) {
    console.error("Error retrieving user stakes from HCS:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve user stakes from HCS"
    });
  }
});

// Get issue stakes from HCS
router.get("/stakes/issue/:repository/:issueNumber", async (req, res) => {
  try {
    const { repository, issueNumber } = req.params;
    const stakes = await getIssueStakesFromHCS(repository, parseInt(issueNumber));
    
    res.json({
      success: true,
      message: `Stakes for ${repository}#${issueNumber} retrieved from HCS successfully`,
      data: {
        repository,
        issueNumber: parseInt(issueNumber),
        stakes,
        count: stakes.length,
        totalStaked: stakes
          .filter(s => s.action === 'create')
          .reduce((sum, stake) => sum + stake.stakeAmount, 0)
      }
    });

  } catch (err: any) {
    console.error("Error retrieving issue stakes from HCS:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve issue stakes from HCS"
    });
  }
});

export default router;