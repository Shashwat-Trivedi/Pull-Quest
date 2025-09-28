// src/controllers/commentController.ts
import { Request, Response, RequestHandler } from "express";
import { postIssueComment, postPullRequestReviewComment, postPRFormComment , postPullRequestComment} from "../utils/githubComment";
import User from "../model/User";
import { fetchCompleteIssueData } from "../utils/githubComment";
import { ingestStakedIssue } from "../ingester/issueIngester";
import { fetchPRDetails } from "../utils/githubComment";
import { ingestMergedPR } from "../ingester/mergedPRIngester";
import { PRTracking } from "../model/PRTracking";

export const commentOnIssue: RequestHandler = async (req, res) => {
  console.log("📥 Incoming payload:", JSON.stringify(req.body, null, 2));

  const {
    owner,       // "PullQuest-Test"
    repo,        // "backend"
    issueNumber, // 6
    labels = []  // ["stake-30","question",…]
  }: {
    owner?: string;
    repo?: string;
    issueNumber?: number;
    labels?: string[];
  } = req.body;

  if (!owner || !repo || !issueNumber) {
    res.status(400).json({ error: "owner, repo and issueNumber are required" });
    return;
  }

  // look for "stake-<N>"
  const stakeLabel = labels.find(l => /^stake[-:\s]?(\d+)$/i.test(l));
  const stakeAmt   = stakeLabel ? Number(stakeLabel.match(/(\d+)/)![1]) : null;

  const commentBody = stakeAmt
    ? `🎉  Thanks for opening this issue!\n\n🪙 **Stake required:** ${stakeAmt} coins.\n\nAnyone who submits a PR must first stake **${stakeAmt}** coins from their balance.`
    : `🎉  Thanks for opening this issue!`;

  try {
    const comment = await postIssueComment(owner, repo, issueNumber, commentBody);
    res.status(201).json({ html_url: comment.html_url });
  } catch (err: any) {
    console.error("❌ Failed to post comment:", err);
    res.status(502).json({ error: err.message ?? "GitHub request failed" });
  }
};

async function fetchIssueDetails(
  owner: string,
  repo: string,
  issueNumber: number
): Promise<{ labels: { name: string }[] }> {
  const token = process.env.GITHUB_COMMENT_TOKEN;
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `GitHub API error fetching issue: ${resp.status} ${resp.statusText} — ${text}`
    );
  }
  return (await resp.json()) as any;
}

// Add this interface for PR tracking
interface IPRData {
  owner: string;
  repo: string;
  prNumber: number;
  author: string;
  description: string;
  labels: string[];
  stakeAmount: number;
  linkedIssue?: number;
  walletCheckScheduled: boolean;
  createdAt: Date;
  status: 'pending' | 'wallet_verified' | 'wallet_pending' | 'completed';
}


export const commentOnPrs: RequestHandler = async (req, res) => {
  console.log("📥 Incoming PR payload:", JSON.stringify(req.body, null, 2));
  
  const websiteUrl = "https://pull-quest-frontend-seven.vercel.app/connect-wallet";

  const { owner, repo, prNumber, author, description = "", labels = [] } = req.body as {
    owner?: string;
    repo?: string;
    prNumber?: number;
    author?: string;
    description?: string;
    labels?: string[];
  };

  if (!owner || !repo || !prNumber || !author) {
    res.status(400).json({ error: "owner, repo, prNumber and author are required" });
    return;
  }

  /* ── 0. Find user in database ─────────────────────────────────── */
  let user = null;
  try {
    user = await User.findOne({ 
      githubUsername: author,
      role: "contributor"
    });
    
    if (user) {
      console.log(`✅ Found contributor: ${author}`);
      console.log(`💰 User coins: ${user.coins}, XP: ${user.xp}, Rank: ${user.rank}`);
      // Check both walletAddress and publicAddress fields
      const hasWallet = (user.walletAddress && user.walletAddress.trim() !== "") || 
                       (user.publicAddress && user.publicAddress.trim() !== "");
      console.log(`🔗 Wallet connected: ${hasWallet ? 'Yes' : 'No'}`);
      console.log(`📍 Wallet fields - walletAddress: ${user.walletAddress || 'null'}, publicAddress: ${user.publicAddress || 'null'}`);
    } else {
      console.log(`❌ Contributor not found: ${author} with role 'contributor'`);
    }
  } catch (error) {
    console.error("⚠️ Error finding user:", error);
  }

  /* ── 1. Extract stake from PR labels (fallback) ─────────────── */
  const stakeFromPR = labels.find(l => /^stake[-:\s]?(\d+)$/i.test(l));
  let stakeAmt = stakeFromPR ? Number(stakeFromPR.match(/(\d+)/)![1]) : 0;

  /* ── 2. Look for "#123" in PR body and fetch that issue's labels ─ */
  const issueMatch = description.match(/#(\d+)/);
  let issueRef = "no linked issue";
  let linkedIssueNumber: number | null = null;

  if (issueMatch) {
    linkedIssueNumber = Number(issueMatch[1]);
    issueRef = `#${linkedIssueNumber}`;

    try {
      const issueData = await fetchIssueDetails(owner, repo, linkedIssueNumber);
      const stakeLabel = issueData.labels
        .map(l => l.name)
        .find(n => /^stake[-:\s]?(\d+)$/i.test(n));

      if (stakeLabel) {
        stakeAmt = Number(stakeLabel.match(/(\d+)/)![1]);
        console.log(`🎯 Found stake amount from linked issue: ${stakeAmt} coins`);
      }
    } catch (e) {
      console.error("⚠️ Could not fetch linked issue:", e);
    }
  }

  /* ── 3. Store PR data in database ──────────────────────────────── */
  let prTrackingRecord = null;
  try {
    // Check wallet status for both fields
    const userWalletStatus = user ? 
      ((user.walletAddress && user.walletAddress.trim() !== "") || 
       (user.publicAddress && user.publicAddress.trim() !== "")) : false;

    prTrackingRecord = await PRTracking.findOneAndUpdate(
      { owner, repo, prNumber },
      {
        owner,
        repo,
        prNumber,
        author,
        description,
        labels,
        stakeAmount: stakeAmt,
        linkedIssue: linkedIssueNumber,
        walletCheckScheduled: true,
        status: user ? (userWalletStatus ? 'wallet_verified' : 'wallet_pending') : 'pending'
      },
      { upsert: true, new: true }
    );
    
    console.log(`📊 PR tracking record saved: ${prTrackingRecord._id}`);
  } catch (error) {
    console.error("❌ Failed to save PR tracking record:", error);
  }

  /* ── 4. Check user and construct comment ──────────────────────── */
  let commentBody: string;
  
  if (!user) {
    const signupUrl = stakeAmt > 0 && linkedIssueNumber 
      ? `${websiteUrl}?owner=${owner}&repo=${repo}&issue=${linkedIssueNumber}`
      : websiteUrl;
    
    if (stakeAmt > 0) {
      commentBody = `👋 Welcome, @${author}! It looks like you're new here. To contribute to a staked issue, you first need to create an account.

### Next Steps:
1. **[Click here to sign up and stake on Issue ${linkedIssueNumber}](${signupUrl})**
2. Connect your wallet to receive your starting coins
3. Complete the stake on our platform

Once you've staked, your pull request can be reviewed.

**Required stake:** ${stakeAmt} coins 🪙`;
    } else {
      commentBody = `👋 Welcome, @${author}! It looks like you're new to our platform.

### Get Started:
1. **[Create your account here](${signupUrl})**
2. Connect your wallet to receive starting coins
3. Start contributing to earn XP and rewards!

This appears to be a regular contribution (no stake required). Once you have an account, you'll be able to track your contributions and earn rewards.

Thanks for your interest in contributing! 🚀`;
    }
  } else if (stakeAmt > 0) {
    const userCoins = user.coins;
    
    if (userCoins >= stakeAmt) {
      console.log(`✅ ${author} has enough coins (${userCoins}) for stake (${stakeAmt})`);
      
      user.coins -= stakeAmt;
      const xpReward = 10;
      user.xp = (user.xp || 0) + xpReward;
      await user.save();
      
      console.log(`💰 Deducted ${stakeAmt} coins. New balance: ${user.coins}`);
      console.log(`🎉 Awarded ${xpReward} XP. New XP: ${user.xp}`);

      if (linkedIssueNumber) {
        console.log(`📊 Processing linked issue #${linkedIssueNumber} for ingestion`);
      }
      
      commentBody = `🎉 Thanks for opening this pull request, @${author}!

• Linked issue: **${issueRef}**
• 🪙 **Stake deducted:** ${stakeAmt} coins
• 💰 **Remaining balance:** ${user.coins} coins
• 🎉 **XP awarded:** +${xpReward} XP (Total: ${user.xp})
• 🏆 **Current rank:** ${user.rank}

Your stake has been successfully processed! 🚀`;
    } else {
      console.log(`❌ ${author} doesn't have enough coins (${userCoins}) for stake (${stakeAmt})`);
      commentBody = `❌ Sorry @${author}, you cannot open this PR.

• **Required stake:** ${stakeAmt} coins
• **Your current coins:** ${userCoins} coins
• **Insufficient funds:** You need ${stakeAmt - userCoins} more coins

**@maintainers:** Please close this PR as the contributor doesn't have sufficient stake.`;
    }
  } else {
    commentBody = `🎉 Thanks for opening this pull request, @${author}! This is a non-staked contribution.

• 🏆 **Current rank:** ${user.rank}
• 💰 **Current coins:** ${user.coins}
• 🎉 **Current XP:** ${user.xp || 0}

Keep up the great work! 🚀`;
  }

  /* ── 5. Post the initial comment to the PR ─────────────────────── */
  try {
    const comment = await postIssueComment(owner, repo, prNumber, commentBody);
    console.log(`✅ Posted initial comment: ${commentBody.substring(0, 100)}...`);
    
    /* ── 6. Send immediate confirmation to frontend ──────────────── */
    // Check wallet for response - support both fields
    const walletConnected = user ? 
      ((user.walletAddress && user.walletAddress.trim() !== "") || 
       (user.publicAddress && user.publicAddress.trim() !== "")) : false;

    const frontendResponse = {
      success: true,
      html_url: comment.html_url,
      pr_tracking_id: prTrackingRecord?._id,
      wallet_check_scheduled: true,
      check_delay_seconds: 90,
      user_found: !!user,
      wallet_connected: walletConnected,
      stake_amount: stakeAmt,
      linked_issue: linkedIssueNumber,
      user_stats: user ? {
        coins: user.coins,
        xp: user.xp,
        rank: user.rank,
        wallet_address: user.walletAddress || user.publicAddress || null
      } : null,
      pr_status: prTrackingRecord?.status || 'pending',
      created_at: new Date().toISOString()
    };

    // Send response immediately to frontend
    res.status(201).json(frontendResponse);
    
    /* ── 7. Schedule async wallet verification check ─────────────── */
    console.log(`⏰ Scheduling wallet verification check for @${author} in 90 seconds...`);
    
    setTimeout(async () => {
      try {
        console.log(`⏰ [${new Date().toISOString()}] Running scheduled wallet check for @${author}...`);
        
        const currentUser = await User.findOne({ githubUsername: author });
        
        let walletCommentBody: string;
        let newStatus = 'wallet_pending';

        if (currentUser) {
          // 🚀 FIXED: Check both walletAddress AND publicAddress
          const hasWallet = (currentUser.walletAddress && 
                            currentUser.walletAddress.trim() !== "" && 
                            currentUser.walletAddress !== null) ||
                           (currentUser.publicAddress && 
                            currentUser.publicAddress.trim() !== "" && 
                            currentUser.publicAddress !== null);

          if (hasWallet) {
            // Use whichever address is available
            const walletAddr = currentUser.walletAddress || currentUser.publicAddress;
            const shortAddress = `${walletAddr!.slice(0, 6)}...${walletAddr!.slice(-4)}`;
            
            walletCommentBody = `✅ **Wallet Connection Verified!**

🎉 @${author} has successfully connected their wallet!

📊 **Wallet Details:**
• **Address:** \`${shortAddress}\`
• **Balance:** ${currentUser.coins || 0} coins
• **XP:** ${currentUser.xp || 0}
• **Rank:** ${currentUser.rank}

You're all set to participate in staked contributions! 🚀`;

            // Update verification status and sync wallet fields
            currentUser.isWalletVerified = true;
            
            // Sync wallet fields - copy publicAddress to walletAddress if missing
            if (!currentUser.walletAddress && currentUser.publicAddress) {
              currentUser.walletAddress = currentUser.publicAddress;
              console.log(`🔄 Synced publicAddress to walletAddress for ${author}`);
            }
            
            await currentUser.save();
            newStatus = 'wallet_verified';
            
          } else if (currentUser.role === "contributor") {
            const signupUrl = stakeAmt > 0 && linkedIssueNumber 
              ? `${websiteUrl}?owner=${owner}&repo=${repo}&issue=${linkedIssueNumber}`
              : websiteUrl;
            
            walletCommentBody = `⏰ **Wallet Connection Pending**

Hey @${author}, we found your account but you haven't connected your wallet yet.

🔗 **Next Steps:**
1. **[Connect your wallet here](${signupUrl})**
2. Complete your wallet setup
3. Start earning rewards!

⚠️ **Note:** Without a connected wallet, you won't be able to stake on issues or receive rewards.`;
            newStatus = 'wallet_pending';
          } else {
            console.log(`⏩ Skipping wallet check for @${author} - not a contributor role`);
            return;
          }
        } else {
          walletCommentBody = `❌ **Account Setup Incomplete**

@${author}, we still haven't found your account in our system.

🔗 **Please complete setup:**
1. **[Create account & connect wallet](${websiteUrl})**
2. Complete the onboarding process
3. Return to start contributing!

Need help? Contact our support team.`;
          newStatus = 'pending';
        }

        // Update PR tracking record
        if (prTrackingRecord) {
          await PRTracking.findByIdAndUpdate(prTrackingRecord._id, { 
            status: newStatus,
            lastChecked: new Date()
          });
        }

        // Post the wallet verification comment
        await postIssueComment(owner, repo, prNumber, walletCommentBody);
        console.log(`✅ Posted wallet verification comment for @${author}`);
        
      } catch (error) {
        console.error(`❌ Scheduled wallet check failed for @${author}:`, error);
        
        // Update PR tracking record with error
        if (prTrackingRecord) {
          try {
            await PRTracking.findByIdAndUpdate(prTrackingRecord._id, { 
              status: 'error',
              lastChecked: new Date()
            });
          } catch (updateError) {
            console.error(`❌ Failed to update PR tracking record:`, updateError);
          }
        }
      }
    }, 90000); // 90 seconds

  } catch (err: any) {
    console.error("❌ Failed to post PR comment:", err);
    res.status(502).json({ error: err.message || "GitHub request failed" });
  }
};

export const formComment: RequestHandler = async (req, res) => {
  console.log("📥 Incoming XP-form payload:", JSON.stringify(req.body, null, 2));

  const { owner, repo, prNumber, commenter } = req.body;

  if (!owner || !repo || !prNumber || !commenter) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  console.log(`🎉 Creating contributor-rating form for @${commenter}`);

  /* ───────────────────────────────────────────────────────────────
     Redesigned markdown comment (looks close to your screenshot)
     ─────────────────────────────────────────────────────────────── */
  const commentBody = `
### 🟢 Merge Feedback  
*Rate this pull request before merging to help improve code quality.*

---

#### 🎯 Current Score  
\`0 / 25 points (0 %)\`

> Fill out the sliders / table below – the score will update automatically once you save the comment.

---

## ⭐ Quality Assessment  
| Category | Poor&nbsp;⬜ | Average&nbsp;⬜ | Good&nbsp;⬜ | Excellent&nbsp;⬜ | Score&nbsp;/5 |
|----------|:-----------:|:-------------:|:-----------:|:----------------:|:-------------:|
| **Code Quality & Standards** | ○ | ○ | ○ | ○ | &nbsp; |
| **Documentation & Comments** | ○ | ○ | ○ | ○ | &nbsp; |
| **Testing Coverage** | ○ | ○ | ○ | ○ | &nbsp; |
| **Performance Impact** | ○ | ○ | ○ | ○ | &nbsp; |
| **Security Considerations** | ○ | ○ | ○ | ○ | &nbsp; |

> &nbsp;⬜ = click to set your rating (1-5) and add notes if needed.

---

## 🎁 Bonus Points *(optional)*
| ✓ | Bonus | XP |
|---|-------|----|
| ☐ | Issue was bounty-backed | **+10** |
| ☐ | PR merged within 24-48 hrs | **+5** |
| ☐ | Contributor also reviewed other PRs | **+5** |
| ☐ | Contributor added meaningful tests | **+10** |

---

> **Maintainers:** to award extra XP, create a new comment like  
> \`@pullquestai add 50 xp to @${commenter}\`  (you can replace **50** with any whole-number).

Keep up the awesome work 🚀
`;

  try {
    const comment = await postPRFormComment(owner, repo, prNumber, commentBody);
    console.log(`✅ Form posted successfully: ${comment.html_url}`);

    res.status(201).json({
      success: true,
      comment_url: comment.html_url,
      commenter,
      pr_number: prNumber
    });
  } catch (err: any) {
    console.error("❌ Failed to post contributor-rating form:", err);
    res.status(502).json({
      error: err.message ?? "GitHub request failed",
      details: { owner, repo, prNumber, commenter }
    });
  }
};
export const AddbonusXp: RequestHandler = async (req, res) => {
  console.log("📥 Incoming bonus XP payload:", JSON.stringify(req.body, null, 2));
  
  const { owner, repo, prNumber, targetUser, xpAmount, requester } = req.body;
  
  if (!owner || !repo || !prNumber || !targetUser || !xpAmount) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  
  console.log(`🎉 Adding ${xpAmount} XP to @${targetUser}`);
  
  try {
    /* ── 1. Find the target user in database ─────────────────────── */
    const user = await User.findOne({ 
      githubUsername: targetUser,
      role: "contributor"
    });
    
    if (!user) {
      console.log(`❌ User not found: ${targetUser}`);
      const commentBody = `❌ Error: User @${targetUser} not found in our system.`;
      const comment = await postPRFormComment(owner, repo, prNumber, commentBody);
      res.status(404).json({ 
        error: "User not found", 
        comment_url: comment.html_url 
      });
      return;
    }
    
    console.log(`✅ Found user: ${targetUser}`);
    
    /* ── 2. Add XP to user profile ──────────────────────────────── */
    const oldXp = user.xp || 0;
    const oldRank = user.rank;
    
    user.xp = oldXp + Number(xpAmount);
    user.lastLogin = new Date();
    await user.save();
    
    console.log(`💰 XP: ${oldXp} → ${user.xp} (+${xpAmount})`);
    
    /* ── 3. Fetch PR details and ingest to MergedPR collection ──── */
    let ingestionResult = null;
    try {
      const prData = await fetchPRDetails(owner, repo, prNumber);
      
      ingestionResult = await ingestMergedPR({
        prData: prData,
        awardedUser: user,
        bonusXpAmount: Number(xpAmount),
        awardedBy: requester || "maintainer",
        owner: owner,
        repo: repo
      });
      
      console.log(`✅ PR ingested: ${ingestionResult.message}`);
      
    } catch (error) {
      console.error("❌ Failed to ingest PR data:", error);
    }
    
    /* ── 4. Post enhanced success comment ───────────────────────── */
    const rankChange = oldRank !== user.rank ? ` → **${user.rank}**` : "";
    const ingestionStatus = ingestionResult 
      ? `\n• 📊 **PR Data**: Successfully recorded in merge history`
      : `\n• ⚠️ **PR Data**: Could not record merge history`;
    
    const commentBody = `🎉 **Bonus XP Awarded Successfully!**

✅ Added **${xpAmount} XP** to @${targetUser}

📊 **Updated User Stats:**
• **XP**: ${oldXp} → **${user.xp}** (+${xpAmount})
• **Rank**: ${oldRank}${rankChange}
• **Total Coins**: ${user.coins}${ingestionStatus}

🏆 **PR Summary:**
• **Pull Request**: #${prNumber}
• **Repository**: ${owner}/${repo}
• **Awarded by**: ${requester || 'maintainer'}

Keep up the excellent work! 🚀`;
    
    const comment = await postPRFormComment(owner, repo, prNumber, commentBody);
    
    res.status(201).json({ 
      success: true, 
      comment_url: comment.html_url,
      user_stats: {
        username: user.githubUsername,
        old_xp: oldXp,
        new_xp: user.xp,
        xp_added: Number(xpAmount),
        old_rank: oldRank,
        new_rank: user.rank,
        coins: user.coins
      },
      pr_ingestion: {
        success: !!ingestionResult,
        message: ingestionResult?.message || "Failed to ingest PR data",
        database_id: ingestionResult?.mergedPRId || null,
        is_update: ingestionResult?.isUpdate || false
      }
    });
    
  } catch (err: any) {
    console.error("❌ Failed to process bonus XP:", err);
    res.status(502).json({ 
      error: err.message ?? "Failed to process bonus XP"
    });
  }
};

export const stakeComment = async (req: Request, res: Response) => {
  try {
    const { prNumber, user, owner, repo } = req.body;

    if (!prNumber || !user || !owner || !repo) {
      return res.status(400).json({
        success: false,
        message: "prNumber, user, owner, and repo are required"
      });
    }

    const commentBody = `User @${user} has staked money on PR Mentioned in the PR Description. Thank you!`;

    const commentResponse = await postPullRequestComment(
      owner,
      repo,
      prNumber,
      commentBody
    );

    res.json({
      success: true,
      message: "Comment posted successfully",
      commentUrl: commentResponse.html_url
    });
  } catch (error: any) {
    console.error("Error posting stake comment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to post comment"
    });
  }
};

export const xpAwardComment = async (req: Request, res: Response) => {
  try {
    const { 
      prNumber, 
      targetUser, 
      awardedBy, 
      xpPoints, 
      owner, 
      repo,
    } = req.body;

    if (!prNumber || !targetUser || !awardedBy || !xpPoints || !owner || !repo) {
      return res.status(400).json({
        success: false,
        message: "prNumber, targetUser, awardedBy, xpPoints, owner, and repo are required"
      });
    }

    const commentBody = `🎉 **XP Awarded!** 🎉

@${targetUser} has been awarded **${xpPoints} XP** by @${awardedBy} for their contribution to this PR!

**Transaction Details:**
- XP Points: ${xpPoints}
- Recorded on: Hedera Testnet

This XP has been permanently recorded on the Hedera blockchain and HCS-2 consensus service.

Thank you for your valuable contribution! 🚀`;

    const commentResponse = await postPullRequestComment(
      owner,
      repo,
      prNumber,
      commentBody
    );

    res.json({
      success: true,
      message: "XP award comment posted successfully",
      commentUrl: commentResponse.html_url,
      commentId: commentResponse.id
    });
  } catch (error: any) {
    console.error("Error posting XP award comment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to post XP award comment"
    });
  }
};

export const bountyAwardComment = async (req: Request, res: Response) => {
  try {
    const { 
      prNumber, 
      targetUser, 
      awardedBy, 
      bountyAmount, 
      owner, 
      repo,
      transferTxHash
    } = req.body;

    if (!prNumber || !targetUser || !awardedBy || !bountyAmount || !owner || !repo) {
      return res.status(400).json({
        success: false,
        message: "prNumber, targetUser, awardedBy, bountyAmount, owner, and repo are required"
      });
    }

    const commentBody = `💰 **Bounty Paid!** 💰

@${targetUser} has been paid **${bountyAmount} HBAR** bounty by @${awardedBy} for their contribution to this PR!

**Payment Details:**
- Amount: ${bountyAmount} HBAR
- Network: Hedera Testnet
${transferTxHash ? `- Transaction Hash: \`${transferTxHash}\`` : ''}

This bounty payment has been permanently recorded on the Hedera blockchain.

Thank you for your valuable contribution! 🚀`;

    const commentResponse = await postPullRequestComment(
      owner,
      repo,
      prNumber,
      commentBody
    );

    res.json({
      success: true,
      message: "Bounty payment comment posted successfully",
      commentUrl: commentResponse.html_url,
      commentId: commentResponse.id
    });
  } catch (error: any) {
    console.error("Error posting bounty comment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to post bounty comment"
    });
  }
};