import express from "express";
import { ethers, JsonRpcProvider } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const provider = new JsonRpcProvider("https://testnet.hashio.io/api");

// Contract configuration
const contractAddress = process.env.CONTRACT_ADDRESS as string;
const scheduledTransfersAddress = process.env.SCHEDULED_TRANSFERS_ADDRESS as string;

// Original ABI for backward compatibility
const originalAbi = [
  "function createIssue(string memory _githubIssueUrl, string memory _title, string memory _description) external payable",
  "function addStake(uint256 _issueId) external payable",
  "function assignIssue(uint256 _issueId, address _assignee) external",
  "function getIssue(uint256 _issueId) external view returns (uint256 id, string memory githubIssueUrl, string memory title, string memory description, address creator, address assignee, uint256 stakeAmount, uint256 bountyAmount, uint8 status, uint256 createdAt, uint256 resolvedAt, string memory resolutionProof)",
  "function getUserIssues(address _user) external view returns (uint256[] memory)",
  "function nextIssueId() external view returns (uint256)",
  
  // Events
  "event IssueCreated(uint256 indexed issueId, address indexed creator, string githubIssueUrl, string title, uint256 stakeAmount)",
  "event StakeAdded(uint256 indexed issueId, address indexed staker, uint256 amount, uint256 totalStake)"
];

// Extended ABI with new functions
const extendedAbi = [
  // Original functions
  "function createIssue(string memory _githubIssueUrl, string memory _title, string memory _description) external payable",
  "function addStake(uint256 _issueId) external payable",
  
  // New enhanced functions
  "function createIssueWithBounty(string memory _githubIssueUrl, string memory _title, string memory _description, uint256 _stakeAmount, uint256 _bountyAmount) external payable",
  "function addBounty(uint256 _issueId) external payable",
  "function assignIssue(uint256 _issueId, address _assignee) external",
  "function submitResolution(uint256 _issueId, string memory _resolutionProof) external",
  "function approveResolution(uint256 _issueId) external",
  "function raiseDispute(uint256 _issueId) external",
  "function resolveDispute(uint256 _issueId, bool _approveResolution) external",
  "function cancelIssue(uint256 _issueId) external",
  "function withdrawBountyContribution(uint256 _issueId) external",
  
  // View functions
  "function getIssue(uint256 _issueId) external view returns (uint256 id, string memory githubIssueUrl, string memory title, string memory description, address creator, address assignee, uint256 stakeAmount, uint256 bountyAmount, uint256 totalEscrowed, uint8 status, uint256 createdAt, uint256 resolvedAt, string memory resolutionProof)",
  "function getUserBountyContribution(uint256 _issueId, address _user) external view returns (uint256)",
  "function getIssueStakeholders(uint256 _issueId) external view returns (address[] memory)",
  "function getUserIssues(address _user) external view returns (uint256[] memory)",
  "function getUserBountyContributions(address _user) external view returns (uint256[] memory)",
  "function nextIssueId() external view returns (uint256)",
  
  // Events
  "event IssueCreated(uint256 indexed issueId, address indexed creator, string githubIssueUrl, string title, uint256 stakeAmount, uint256 bountyAmount, uint256 totalEscrowed)",
  "event LogIssueCreationAttempt(address indexed sender, uint256 stakeAmountFromInput, uint256 bountyAmountFromInput, uint256 valueSentWithTx, string githubUrl)",
  "event BountyAdded(uint256 indexed issueId, address indexed contributor, uint256 amount, uint256 totalBounty)",
  "event LogBountyAddAttempt(address indexed sender, uint256 indexed issueId, uint256 valueSentWithTx)",
  "event IssueAssigned(uint256 indexed issueId, address indexed assignee)",
  "event IssueStatusChanged(uint256 indexed issueId, uint8 oldStatus, uint8 newStatus)",
  "event IssueResolved(uint256 indexed issueId, address indexed resolver, string resolutionProof, uint256 bountyPayout, uint256 stakeReturned)",
  "event BountyWithdrawn(uint256 indexed issueId, address indexed contributor, uint256 amount)",
  "event DisputeRaised(uint256 indexed issueId, address indexed disputer)"
];

// Scheduled Transfers ABI
const scheduledTransfersAbi = [
  "function mapGithubToAddress(string memory _githubUsername, address _userAddress) external",
  "function scheduleTransfer(uint256 _issueId, string memory _githubUsername, uint256 _amount, uint256 _delayInSeconds) external payable",
  "function executeTransfer(uint256 _transferId) external",
  "function cancelTransfer(uint256 _transferId) external",
  "function getScheduledTransfer(uint256 _transferId) external view returns (uint256 issueId, string memory githubUsername, address recipient, uint256 amount, uint256 executeAt, bool executed)",
  "function getGithubAddress(string memory _githubUsername) external view returns (address)",
  "function nextTransferId() external view returns (uint256)",
  
  // Events
  "event TransferScheduled(uint256 indexed transferId, uint256 indexed issueId, string githubUsername, address recipient, uint256 amount, uint256 executeAt)",
  "event TransferExecuted(uint256 indexed transferId, address recipient, uint256 amount)",
  "event GithubAddressMapped(string githubUsername, address userAddress)"
];

// Initialize wallet and contracts
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
const originalContract = new ethers.Contract(contractAddress, originalAbi, wallet);
const enhancedContract = new ethers.Contract(contractAddress, extendedAbi, wallet);
const scheduledTransfersContract = scheduledTransfersAddress ? 
  new ethers.Contract(scheduledTransfersAddress, scheduledTransfersAbi, wallet) : null;

// Helper function to convert HBAR to wei
const hbarToWei = (hbarAmount: number) => {
  return ethers.parseEther(hbarAmount.toString());
};

// Status enum mapping
const IssueStatus = {
  Open: 0,
  InProgress: 1,
  UnderReview: 2,
  Resolved: 3,
  Disputed: 4,
  Cancelled: 5
};

const getStatusName = (status: number) => {
  const statusNames = ['Open', 'InProgress', 'UnderReview', 'Resolved', 'Disputed', 'Cancelled'];
  return statusNames[status] || 'Unknown';
};

// ===================================================================
// ORIGINAL ROUTES (UNCHANGED - for backward compatibility)
// ===================================================================

router.post("/maintainer/create-issue", async (req, res) => {
  try {
    const { 
      owner, 
      repo, 
      title, 
      body, 
      stakeAmount,
      labels,
      assignees,
      milestone 
    } = req.body;

    // Validate required fields
    if (!owner || !repo || !title || !stakeAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "owner, repo, title, and stakeAmount are required" 
      });
    }

    // Convert stake amount to wei
    const stakeAmountWei = hbarToWei(stakeAmount);
    
    // Create GitHub issue URL
    const githubIssueUrl = `https://github.com/${owner}/${repo}/issues/new`;
    
    console.log("Creating issue on blockchain (original)...", {
      githubIssueUrl,
      title,
      description: body || "",
      stakeAmount: stakeAmount + " HBAR"
    });

    // Create issue on blockchain with stake
    const tx = await originalContract.createIssue(
      githubIssueUrl,
      title,
      body || "",
      { 
        value: stakeAmountWei,
        gasLimit: 500000
      }
    );

    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.hash);

    // Extract the issue ID from the event logs
    const issueCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = originalContract.interface.parseLog(log);
        return parsed?.name === 'IssueCreated';
      } catch {
        return false;
      }
    });

    let issueId = null;
    if (issueCreatedEvent) {
      const parsed = originalContract.interface.parseLog(issueCreatedEvent);
      issueId = parsed?.args[0]?.toString();
    }

    res.json({ 
      success: true, 
      data: {
        number: issueId || "unknown",
        title: title,
        html_url: githubIssueUrl,
        txHash: tx.hash,
        stakeAmount: stakeAmount,
        blockchainIssueId: issueId
      }
    });

  } catch (err: any) {
    console.error("Error creating issue:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("/maintainer/add-stake", async (req, res) => {
  try {
    const { issueId, stakeAmount } = req.body;

    if (!issueId || !stakeAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId and stakeAmount are required" 
      });
    }

    const stakeAmountWei = hbarToWei(stakeAmount);

    console.log(`Adding ${stakeAmount} HBAR stake to issue ${issueId} (original)...`);

    const tx = await originalContract.addStake(issueId, {
      value: stakeAmountWei,
      gasLimit: 300000
    });

    const receipt = await tx.wait();
    console.log("Stake added:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      stakeAmount: stakeAmount
    });

  } catch (err: any) {
    console.error("Error adding stake:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.get("/maintainer/issue/:issueId", async (req, res) => {
  try {
    const { issueId } = req.params;

    console.log(`Fetching issue ${issueId} from blockchain...`);

    const issue = await originalContract.getIssue(issueId);
    
    res.json({ 
      success: true, 
      data: {
        id: issue[0].toString(),
        githubIssueUrl: issue[1],
        title: issue[2],
        description: issue[3],
        creator: issue[4],
        assignee: issue[5],
        stakeAmount: ethers.formatEther(issue[6]),
        bountyAmount: ethers.formatEther(issue[7]),
        status: issue[8], // 0=Open, 1=InProgress, 2=UnderReview, 3=Resolved, 4=Disputed, 5=Cancelled
        createdAt: issue[9].toString(),
        resolvedAt: issue[10].toString(),
        resolutionProof: issue[11]
      }
    });

  } catch (err: any) {
    console.error("Error fetching issue:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch issue" 
    });
  }
});

router.get("/maintainer/user-issues/:address", async (req, res) => {
  try {
    const { address } = req.params;

    console.log(`Fetching issues for user ${address}...`);

    const userIssues = await originalContract.getUserIssues(address);
    
    res.json({ 
      success: true, 
      data: userIssues.map((id: any) => id.toString())
    });

  } catch (err: any) {
    console.error("Error fetching user issues:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch user issues" 
    });
  }
});

router.post("/maintainer/assign-issue", async (req, res) => {
  try {
    const { issueId, assigneeAddress } = req.body;

    if (!issueId || !assigneeAddress) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId and assigneeAddress are required" 
      });
    }

    console.log(`Assigning issue ${issueId} to ${assigneeAddress}...`);

    const tx = await originalContract.assignIssue(issueId, assigneeAddress, {
      gasLimit: 300000
    });

    const receipt = await tx.wait();
    console.log("Issue assigned:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      issueId: issueId,
      assignee: assigneeAddress
    });

  } catch (err: any) {
    console.error("Error assigning issue:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

// ===================================================================
// NEW ENHANCED ROUTES (using enhanced contract functions)
// ===================================================================

router.post("/v2/maintainer/create-issue-with-bounty", async (req, res) => {
  try {
    const { 
      owner, 
      repo, 
      title, 
      body, 
      stakeAmount,  // Off-chain tracking amount
      bountyAmount, // Actual HBAR amount that will be escrowed
      labels,
      assignees,
      milestone 
    } = req.body;

    // Validate required fields
    if (!owner || !repo || !title || !bountyAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "owner, repo, title, and bountyAmount are required" 
      });
    }

    // Convert bounty amount to wei (this is the actual HBAR being sent)
    const bountyAmountWei = hbarToWei(bountyAmount);
    const stakeAmountValue = stakeAmount || 0; // Off-chain tracking only
    
    // Create GitHub issue URL
    const githubIssueUrl = `https://github.com/${owner}/${repo}/issues/new`;
    
    console.log("Creating issue with bounty on blockchain (v2)...", {
      githubIssueUrl,
      title,
      description: body || "",
      stakeAmount: stakeAmountValue + " HBAR (off-chain)",
      bountyAmount: bountyAmount + " HBAR (escrowed)"
    });

    // Create issue on blockchain with bounty
    const tx = await enhancedContract.createIssueWithBounty(
      githubIssueUrl,
      title,
      body || "",
      hbarToWei(stakeAmountValue), // Off-chain tracking amount in wei
      bountyAmountWei,             // Actual bounty amount in wei
      { 
        value: bountyAmountWei,    // Must equal _bountyAmount parameter
        gasLimit: 800000
      }
    );

    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.hash);

    // Extract the issue ID from the event logs
    const issueCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = enhancedContract.interface.parseLog(log);
        return parsed?.name === 'IssueCreated';
      } catch {
        return false;
      }
    });

    let issueId = null;
    if (issueCreatedEvent) {
      const parsed = enhancedContract.interface.parseLog(issueCreatedEvent);
      issueId = parsed?.args[0]?.toString();
    }

    res.json({ 
      success: true, 
      data: {
        number: issueId || "unknown",
        title: title,
        html_url: githubIssueUrl,
        txHash: tx.hash,
        stakeAmount: stakeAmountValue,
        bountyAmount: bountyAmount,
        blockchainIssueId: issueId
      }
    });

  } catch (err: any) {
    console.error("Error creating issue with bounty:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("/v2/maintainer/add-bounty", async (req, res) => {
  try {
    const { issueId, bountyAmount } = req.body;

    if (!issueId || !bountyAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId and bountyAmount are required" 
      });
    }

    const bountyAmountWei = hbarToWei(bountyAmount);

    console.log(`Adding ${bountyAmount} HBAR bounty to issue ${issueId} (v2)...`);

    const tx = await enhancedContract.addBounty(issueId, {
      value: bountyAmountWei,
      gasLimit: 400000
    });

    const receipt = await tx.wait();
    console.log("Bounty added:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      bountyAmount: bountyAmount
    });

  } catch (err: any) {
    console.error("Error adding bounty:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.get("/v2/maintainer/issue/:issueId", async (req, res) => {
  try {
    const { issueId } = req.params;

    console.log(`Fetching enhanced issue ${issueId} from blockchain...`);

    const issue = await enhancedContract.getIssue(issueId);
    
    res.json({ 
      success: true, 
      data: {
        id: issue[0].toString(),
        githubIssueUrl: issue[1],
        title: issue[2],
        description: issue[3],
        creator: issue[4],
        assignee: issue[5],
        stakeAmount: ethers.formatEther(issue[6]), // Off-chain tracking
        bountyAmount: ethers.formatEther(issue[7]), // Actual escrowed HBAR
        totalEscrowed: ethers.formatEther(issue[8]), // Total escrowed (bounty only)
        status: issue[9],
        statusName: getStatusName(issue[9]),
        createdAt: issue[10].toString(),
        resolvedAt: issue[11].toString(),
        resolutionProof: issue[12]
      }
    });

  } catch (err: any) {
    console.error("Error fetching enhanced issue:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch issue" 
    });
  }
});

router.get("/v2/maintainer/user-bounty-contributions/:address", async (req, res) => {
  try {
    const { address } = req.params;

    console.log(`Fetching bounty contributions for user ${address}...`);

    const userContributions = await enhancedContract.getUserBountyContributions(address);
    
    res.json({ 
      success: true, 
      data: userContributions.map((id: any) => id.toString())
    });

  } catch (err: any) {
    console.error("Error fetching user bounty contributions:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch user bounty contributions" 
    });
  }
});

router.get("/v2/maintainer/issue/:issueId/stakeholders", async (req, res) => {
  try {
    const { issueId } = req.params;

    console.log(`Fetching stakeholders for issue ${issueId}...`);

    const stakeholders = await enhancedContract.getIssueStakeholders(issueId);
    
    res.json({ 
      success: true, 
      data: stakeholders
    });

  } catch (err: any) {
    console.error("Error fetching issue stakeholders:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch issue stakeholders" 
    });
  }
});

router.get("/v2/maintainer/issue/:issueId/user-contribution/:address", async (req, res) => {
  try {
    const { issueId, address } = req.params;

    console.log(`Fetching bounty contribution for user ${address} on issue ${issueId}...`);

    const contribution = await enhancedContract.getUserBountyContribution(issueId, address);
    
    res.json({ 
      success: true, 
      data: {
        issueId: issueId,
        userAddress: address,
        bountyContribution: ethers.formatEther(contribution)
      }
    });

  } catch (err: any) {
    console.error("Error fetching user bounty contribution:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch user bounty contribution" 
    });
  }
});

router.post("/v2/developer/submit-resolution", async (req, res) => {
  try {
    const { issueId, resolutionProof } = req.body;

    if (!issueId || !resolutionProof) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId and resolutionProof are required" 
      });
    }

    console.log(`Submitting resolution for issue ${issueId}...`);

    const tx = await enhancedContract.submitResolution(issueId, resolutionProof, {
      gasLimit: 400000
    });

    const receipt = await tx.wait();
    console.log("Resolution submitted:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      issueId: issueId,
      resolutionProof: resolutionProof
    });

  } catch (err: any) {
    console.error("Error submitting resolution:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("/v2/maintainer/approve-resolution", async (req, res) => {
  try {
    const { issueId } = req.body;

    if (!issueId) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId is required" 
      });
    }

    console.log(`Approving resolution for issue ${issueId}...`);

    const tx = await enhancedContract.approveResolution(issueId, {
      gasLimit: 500000
    });

    const receipt = await tx.wait();
    console.log("Resolution approved:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      issueId: issueId
    });

  } catch (err: any) {
    console.error("Error approving resolution:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("/v2/stakeholder/raise-dispute", async (req, res) => {
  try {
    const { issueId } = req.body;

    if (!issueId) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId is required" 
      });
    }

    console.log(`Raising dispute for issue ${issueId}...`);

    const tx = await enhancedContract.raiseDispute(issueId, {
      gasLimit: 400000
    });

    const receipt = await tx.wait();
    console.log("Dispute raised:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      issueId: issueId
    });

  } catch (err: any) {
    console.error("Error raising dispute:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("/v2/maintainer/cancel-issue", async (req, res) => {
  try {
    const { issueId } = req.body;

    if (!issueId) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId is required" 
      });
    }

    console.log(`Cancelling issue ${issueId}...`);

    const tx = await enhancedContract.cancelIssue(issueId, {
      gasLimit: 600000
    });

    const receipt = await tx.wait();
    console.log("Issue cancelled:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      issueId: issueId
    });

  } catch (err: any) {
    console.error("Error cancelling issue:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("/v2/stakeholder/withdraw-bounty", async (req, res) => {
  try {
    const { issueId } = req.body;

    if (!issueId) {
      return res.status(400).json({ 
        success: false, 
        message: "issueId is required" 
      });
    }

    console.log(`Withdrawing bounty contribution for issue ${issueId}...`);

    const tx = await enhancedContract.withdrawBountyContribution(issueId, {
      gasLimit: 400000
    });

    const receipt = await tx.wait();
    console.log("Bounty withdrawn:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      issueId: issueId
    });

  } catch (err: any) {
    console.error("Error withdrawing bounty:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});


router.post("/v2/admin/map-github-address", async (req, res) => {
  try {
    const { githubUsername, userAddress } = req.body;

    if (!githubUsername || !userAddress) {
      return res.status(400).json({ 
        success: false, 
        message: "githubUsername and userAddress are required" 
      });
    }

    if (!scheduledTransfersContract) {
      return res.status(400).json({ 
        success: false, 
        message: "Scheduled transfers contract not configured" 
      });
    }

    console.log(`Mapping GitHub user ${githubUsername} to address ${userAddress}...`);

    const tx = await scheduledTransfersContract.mapGithubToAddress(githubUsername, userAddress, {
      gasLimit: 200000
    });

    const receipt = await tx.wait();
    console.log("GitHub address mapped:", receipt.hash);

    res.json({ 
      success: true, 
      txHash: tx.hash,
      githubUsername: githubUsername,
      userAddress: userAddress
    });

  } catch (err: any) {
    console.error("Error mapping GitHub address:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Transaction failed" 
    });
  }
});

router.post("v2/schedule-transfer", async (req, res) => {
  try {
    const { issueId, githubUsername, amount, delayInSeconds } = req.body;

    if (!issueId || !githubUsername || !amount || delayInSeconds === undefined) {
      return res.status(400).json({
        success: false,
        message: "issueId, githubUsername, amount, and delayInSeconds are required"
      });
    }

    if (!scheduledTransfersContract) {
      return res.status(400).json({
        success: false,
        message: "Scheduled transfers contract not configured"
      });
    }

    const amountWei = hbarToWei(amount);

    console.log(`Scheduling transfer of ${amount} HBAR for GitHub user ${githubUsername}...`);

    const tx = await scheduledTransfersContract.scheduleTransfer(
      issueId,
      githubUsername,
      amountWei,
      delayInSeconds,
      {
        value: amountWei,
        gasLimit: 400000
      }
    );

    const receipt = await tx.wait();
    console.log("Transfer scheduled:", receipt.hash);

    // Extract the transfer ID from event logs
    const transferScheduledEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = scheduledTransfersContract!.interface.parseLog(log);
        return parsed?.name === 'TransferScheduled';
      } catch {
        return false;
      }
    });

    let transferId = null;
    if (transferScheduledEvent) {
      const parsed = scheduledTransfersContract!.interface.parseLog(transferScheduledEvent);
      transferId = parsed?.args[0]?.toString();
    }

    res.json({
      success: true,
      message: "Transfer scheduled successfully.",
      txHash: tx.hash,
      transferId: transferId,
      details: {
        issueId: issueId,
        githubUsername: githubUsername,
        amount: amount,
        delayInSeconds: delayInSeconds
      }
    });

  } catch (err: any) {
    console.error("Error scheduling transfer:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Transaction failed"
    });
  }
});

export default router;