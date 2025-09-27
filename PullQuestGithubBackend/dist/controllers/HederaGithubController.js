"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaGithubService = exports.HederaGithubService = void 0;
const openai_1 = require("@langchain/openai");
const output_parsers_1 = require("langchain/output_parsers");
const prompts_1 = require("@langchain/core/prompts");
const zod_1 = require("zod");
const hederaConfig = {
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY,
    network: "testnet", // or "mainnet"
};
console.log("🔧 Initializing Hedera GitHub Controller with config:", {
    accountId: hederaConfig.accountId ? `${hederaConfig.accountId.slice(0, 8)}...` : 'MISSING',
    privateKeySet: !!hederaConfig.privateKey,
    network: hederaConfig.network
});
const llm = new openai_1.ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4",
    temperature: 0.1,
});
console.log("🤖 LangChain OpenAI initialized with model: gpt-4, temperature: 0.1");
// Structured output schemas
const PRReviewSchema = zod_1.z.object({
    qualityScore: zod_1.z.number().min(0).max(100),
    tokenReward: zod_1.z.number().min(0).max(1000),
    summary: zod_1.z.string(),
    recommendations: zod_1.z.array(zod_1.z.string()),
    shouldMint: zod_1.z.boolean(),
    riskLevel: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]),
});
const ContributorReputationSchema = zod_1.z.object({
    reputationScore: zod_1.z.number().min(0).max(100),
    contributions: zod_1.z.number(),
    qualityAverage: zod_1.z.number(),
    trustLevel: zod_1.z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
    recommendedRole: zod_1.z.string(),
});
// Structured output parsers
const prReviewParser = output_parsers_1.StructuredOutputParser.fromZodSchema(PRReviewSchema);
const reputationParser = output_parsers_1.StructuredOutputParser.fromZodSchema(ContributorReputationSchema);
console.log("📋 Zod schemas and parsers initialized successfully");
class HederaGithubService {
    async getHederaAgent() {
        try {
            // For now, return a mock agent to test the rest of the system
            return {
                submitMessageToTopic: async (topicId, message) => {
                    console.log(`Mock: Submitting message to topic ${topicId}:`, message);
                    return {
                        transactionId: `mock-tx-${Date.now()}`,
                        consensusTimestamp: new Date().toISOString()
                    };
                },
                createToken: async (name, symbol, amount, decimals, treasury) => {
                    console.log(`Mock: Creating token ${name} (${symbol})`);
                    return {
                        tokenId: `0.0.${Math.floor(Math.random() * 1000000)}`,
                        transactionId: `mock-tx-${Date.now()}`
                    };
                },
                transferToken: async (tokenId, recipient, amount) => {
                    console.log(`Mock: Transferring ${amount} of token ${tokenId} to ${recipient}`);
                    return {
                        transactionId: `mock-tx-${Date.now()}`
                    };
                },
                mintNFT: async (tokenId, metadata, recipient) => {
                    console.log(`Mock: Minting NFT for token ${tokenId}`);
                    return {
                        tokenId,
                        serialNumber: Math.floor(Math.random() * 1000),
                        transactionId: `mock-tx-${Date.now()}`
                    };
                }
            };
        }
        catch (error) {
            console.error("Failed to create Hedera agent:", error);
            throw new Error("Hedera Agent could not be created. Check your configuration and ensure hedera-agent-kit is installed.");
        }
    }
    /**
     * Main endpoint - AI-powered PR review with Hedera rewards
     */
    async handleAIPRReview(req, res) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        console.log(`🚀 [${requestId}] Starting AI PR Review request`);
        console.log(`📋 [${requestId}] Request body:`, {
            ...req.body,
            githubToken: req.body.githubToken ? 'PROVIDED' : 'MISSING'
        });
        try {
            const { owner, repo, prNumber, author, githubToken } = req.body;
            if (!owner || !repo || !prNumber || !author) {
                console.error(`❌ [${requestId}] Missing required fields:`, {
                    owner: !!owner,
                    repo: !!repo,
                    prNumber: !!prNumber,
                    author: !!author
                });
                res.status(400).json({ error: "Missing required fields" });
                return;
            }
            console.log(`🎯 [${requestId}] Processing PR Review for ${owner}/${repo}#${prNumber} by ${author}`);
            // 1. Fetch PR data from GitHub
            console.log(`📥 [${requestId}] Step 1: Fetching PR data from GitHub...`);
            const prDataStart = Date.now();
            const prData = await this.fetchPRData(owner, repo, prNumber, githubToken);
            const prDataTime = Date.now() - prDataStart;
            console.log(`✅ [${requestId}] PR data fetched successfully in ${prDataTime}ms`, {
                title: prData.title,
                author: prData.author,
                changedFiles: prData.changedFiles,
                additions: prData.additions,
                deletions: prData.deletions
            });
            // 2. Run AI analysis with LangChain
            console.log(`🤖 [${requestId}] Step 2: Running AI analysis...`);
            const aiReviewStart = Date.now();
            const aiReview = await this.generateAIReview(prData);
            const aiReviewTime = Date.now() - aiReviewStart;
            console.log(`✅ [${requestId}] AI analysis completed in ${aiReviewTime}ms`, {
                qualityScore: aiReview.qualityScore,
                tokenReward: aiReview.tokenReward,
                shouldMint: aiReview.shouldMint,
                riskLevel: aiReview.riskLevel,
                recommendationsCount: aiReview.recommendations.length
            });
            // 3. Record review on Hedera (immutable audit trail)
            console.log(`⛓️ [${requestId}] Step 3: Recording review on Hedera...`);
            const recordStart = Date.now();
            const reviewRecord = await this.recordReviewOnHedera(aiReview, prData);
            const recordTime = Date.now() - recordStart;
            console.log(`✅ [${requestId}] Review recorded on Hedera in ${recordTime}ms`, {
                transactionId: reviewRecord.transactionId,
                consensusTimestamp: reviewRecord.consensusTimestamp
            });
            // 4. If quality is high enough, mint reward tokens
            let rewardTransaction = null;
            if (aiReview.shouldMint && aiReview.qualityScore > 75) {
                console.log(`🪙 [${requestId}] Step 4: Minting reward tokens (score: ${aiReview.qualityScore}, amount: ${aiReview.tokenReward})...`);
                const rewardStart = Date.now();
                rewardTransaction = await this.rewardContributor(author, aiReview.tokenReward);
                const rewardTime = Date.now() - rewardStart;
                console.log(`✅ [${requestId}] Reward tokens processed in ${rewardTime}ms`, {
                    success: !!rewardTransaction,
                    transactionId: rewardTransaction?.transactionId
                });
            }
            else {
                console.log(`⏭️ [${requestId}] Step 4: Skipping token reward (shouldMint: ${aiReview.shouldMint}, score: ${aiReview.qualityScore})`);
            }
            // 5. Update contributor reputation
            console.log(`📊 [${requestId}] Step 5: Updating contributor reputation...`);
            const reputationStart = Date.now();
            const reputationUpdate = await this.updateContributorReputation(author, aiReview.qualityScore);
            const reputationTime = Date.now() - reputationStart;
            console.log(`✅ [${requestId}] Reputation updated in ${reputationTime}ms`, {
                reputationScore: reputationUpdate.reputationScore,
                totalContributions: reputationUpdate.totalContributions
            });
            // 6. Post AI summary to GitHub
            console.log(`💬 [${requestId}] Step 6: Posting AI comment to GitHub...`);
            const commentStart = Date.now();
            await this.postAICommentToGithub(owner, repo, prNumber, aiReview, reviewRecord.transactionId, githubToken);
            const commentTime = Date.now() - commentStart;
            console.log(`✅ [${requestId}] AI comment posted to GitHub in ${commentTime}ms`);
            const totalTime = Date.now() - startTime;
            console.log(`🎉 [${requestId}] AI PR Review completed successfully in ${totalTime}ms`);
            res.json({
                success: true,
                requestId,
                aiReview,
                hederaRecord: reviewRecord,
                rewardTransaction,
                reputationUpdate,
                message: "AI review completed and recorded on Hedera",
                timings: {
                    total: totalTime,
                    prData: prDataTime,
                    aiReview: aiReviewTime,
                    hederaRecord: recordTime,
                    reward: rewardTransaction ? (Date.now() - startTime) : 0,
                    reputation: reputationTime,
                    comment: commentTime
                }
            });
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ [${requestId}] Hedera GitHub AI review failed after ${totalTime}ms:`, {
                error: error.message,
                stack: error.stack,
                requestBody: {
                    ...req.body,
                    githubToken: req.body.githubToken ? 'PROVIDED' : 'MISSING'
                }
            });
            res.status(500).json({
                error: error.message,
                requestId,
                totalTime
            });
        }
    }
    /**
     * Mint contributor achievement NFTs based on GitHub activity
     */
    async mintContributorNFT(req, res) {
        const requestId = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        console.log(`🎨 [${requestId}] Starting NFT minting request`);
        console.log(`📋 [${requestId}] Request body:`, req.body);
        try {
            const { githubUsername, achievementType } = req.body;
            if (!githubUsername) {
                console.error(`❌ [${requestId}] Missing githubUsername`);
                res.status(400).json({ error: "Missing githubUsername" });
                return;
            }
            console.log(`🎯 [${requestId}] Processing NFT mint for user: ${githubUsername}, type: ${achievementType}`);
            // Fetch contributor's GitHub stats
            console.log(`📊 [${requestId}] Step 1: Fetching contributor GitHub stats...`);
            const statsStart = Date.now();
            const contributorStats = await this.fetchContributorStats(githubUsername);
            const statsTime = Date.now() - statsStart;
            console.log(`✅ [${requestId}] GitHub stats fetched in ${statsTime}ms`, {
                publicRepos: contributorStats.public_repos,
                followers: contributorStats.followers,
                following: contributorStats.following
            });
            // Generate AI-powered contributor reputation assessment
            console.log(`🤖 [${requestId}] Step 2: Generating AI reputation assessment...`);
            const assessmentStart = Date.now();
            const reputationAssessment = await this.assessContributorReputation(contributorStats);
            const assessmentTime = Date.now() - assessmentStart;
            console.log(`✅ [${requestId}] Reputation assessment completed in ${assessmentTime}ms`, {
                reputationScore: reputationAssessment.reputationScore,
                trustLevel: reputationAssessment.trustLevel,
                recommendedRole: reputationAssessment.recommendedRole
            });
            // Create NFT metadata based on achievements
            console.log(`📝 [${requestId}] Step 3: Generating NFT metadata...`);
            const metadataStart = Date.now();
            const nftMetadata = await this.generateNFTMetadata(githubUsername, reputationAssessment);
            const metadataTime = Date.now() - metadataStart;
            console.log(`✅ [${requestId}] NFT metadata generated in ${metadataTime}ms`, {
                name: nftMetadata.name,
                attributeCount: nftMetadata.attributes.length
            });
            // Mint NFT on Hedera
            console.log(`⛓️ [${requestId}] Step 4: Minting NFT on Hedera...`);
            const mintStart = Date.now();
            const hederaAgent = await this.getHederaAgent();
            const nftResult = await hederaAgent.mintNFT(process.env.HEDERA_TOKEN_ID, // Your contributor NFT collection
            JSON.stringify(nftMetadata), process.env.HEDERA_ACCOUNT_ID // Recipient
            );
            const mintTime = Date.now() - mintStart;
            console.log(`✅ [${requestId}] NFT minted successfully in ${mintTime}ms`, {
                tokenId: nftResult.tokenId,
                serialNumber: nftResult.serialNumber,
                transactionId: nftResult.transactionId
            });
            const totalTime = Date.now() - startTime;
            console.log(`🎉 [${requestId}] NFT minting completed successfully in ${totalTime}ms`);
            res.json({
                success: true,
                requestId,
                nftTokenId: nftResult.tokenId,
                serialNumber: nftResult.serialNumber,
                metadata: nftMetadata,
                transactionId: nftResult.transactionId,
                reputationScore: reputationAssessment.reputationScore,
                timings: {
                    total: totalTime,
                    stats: statsTime,
                    assessment: assessmentTime,
                    metadata: metadataTime,
                    mint: mintTime
                }
            });
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ [${requestId}] NFT minting failed after ${totalTime}ms:`, {
                error: error.message,
                stack: error.stack,
                requestBody: req.body
            });
            res.status(500).json({
                error: error.message,
                requestId,
                totalTime
            });
        }
    }
    async createBountyWithAI(req, res) {
        const requestId = `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        console.log(`💰 [${requestId}] Starting bounty creation request`);
        console.log(`📋 [${requestId}] Request body:`, req.body);
        try {
            const { issueUrl, bountyAmount, requirements } = req.body;
            if (!issueUrl || !bountyAmount) {
                console.error(`❌ [${requestId}] Missing required fields:`, {
                    issueUrl: !!issueUrl,
                    bountyAmount: !!bountyAmount
                });
                res.status(400).json({ error: "Missing required fields: issueUrl and bountyAmount" });
                return;
            }
            console.log(`🎯 [${requestId}] Processing bounty creation for issue: ${issueUrl}, amount: ${bountyAmount}`);
            console.log(`🔍 [${requestId}] Step 1: Analyzing issue complexity...`);
            const analysisStart = Date.now();
            const issueAnalysis = await this.analyzeIssueComplexity(issueUrl);
            const analysisTime = Date.now() - analysisStart;
            console.log(`✅ [${requestId}] Issue analysis completed in ${analysisTime}ms`, issueAnalysis);
            console.log(`📄 [${requestId}] Step 2: Deploying bounty contract...`);
            const contractStart = Date.now();
            const bountyContract = await this.deployBountyContract(bountyAmount, requirements, issueAnalysis);
            const contractTime = Date.now() - contractStart;
            console.log(`✅ [${requestId}] Bounty contract deployed in ${contractTime}ms`, {
                contractId: bountyContract.contractId
            });
            console.log(`🪙 [${requestId}] Step 3: Creating bounty token...`);
            const tokenStart = Date.now();
            const hederaAgent = await this.getHederaAgent();
            const bountyToken = await hederaAgent.createToken(`Bounty-${Date.now()}`, "BNTY", bountyAmount, 18, process.env.HEDERA_ACCOUNT_ID);
            const tokenTime = Date.now() - tokenStart;
            console.log(`✅ [${requestId}] Bounty token created in ${tokenTime}ms`, {
                tokenId: bountyToken.tokenId
            });
            const totalTime = Date.now() - startTime;
            console.log(`🎉 [${requestId}] Bounty creation completed successfully in ${totalTime}ms`);
            res.json({
                success: true,
                requestId,
                bountyContractId: bountyContract.contractId,
                bountyTokenId: bountyToken.tokenId,
                aiAnalysis: issueAnalysis,
                estimatedReward: issueAnalysis.recommendedBounty,
                timings: {
                    total: totalTime,
                    analysis: analysisTime,
                    contract: contractTime,
                    token: tokenTime
                }
            });
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ [${requestId}] Bounty creation failed after ${totalTime}ms:`, {
                error: error.message,
                stack: error.stack,
                requestBody: req.body
            });
            res.status(500).json({
                error: error.message,
                requestId,
                totalTime
            });
        }
    }
    async fetchPRData(owner, repo, prNumber, githubToken) {
        console.log(`📥 Fetching PR data for ${owner}/${repo}#${prNumber}`);
        const token = githubToken || process.env.GITHUB_COMMENT_TOKEN;
        if (!token) {
            console.error('❌ GitHub token is missing');
            throw new Error('GitHub token is required. Provide it in request body or set GITHUB_COMMENT_TOKEN environment variable.');
        }
        console.log(`🔑 Using GitHub token: ${token.slice(0, 8)}...`);
        try {
            console.log(`🌐 Making API request to GitHub for PR data...`);
            const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'User-Agent': 'PullQuest-GitHub-Bot'
                }
            });
            console.log(`📊 GitHub PR API Response:`, {
                status: prResponse.status,
                statusText: prResponse.statusText,
                ok: prResponse.ok
            });
            if (!prResponse.ok) {
                console.error('❌ GitHub API Error:', prResponse.status, prResponse.statusText);
                const errorText = await prResponse.text();
                console.error('❌ Error details:', errorText);
                throw new Error(`GitHub API error: ${prResponse.status} - ${prResponse.statusText}`);
            }
            const prData = await prResponse.json();
            console.log('✅ PR Data received:', {
                title: prData.title,
                user: prData.user?.login,
                state: prData.state,
                additions: prData.additions,
                deletions: prData.deletions,
                changed_files: prData.changed_files
            });
            // Check if user exists
            if (!prData.user || !prData.user.login) {
                console.error('❌ PR user data is missing or invalid');
                console.error('📋 Full PR Data keys:', Object.keys(prData));
                throw new Error('PR user data is missing or invalid');
            }
            // Fetch PR diff
            console.log(`📄 Fetching PR diff...`);
            const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3.diff",
                    'User-Agent': 'PullQuest-GitHub-Bot'
                }
            });
            console.log(`📊 GitHub Diff API Response:`, {
                status: diffResponse.status,
                statusText: diffResponse.statusText,
                ok: diffResponse.ok
            });
            const diff = await diffResponse.text();
            console.log(`✅ Diff fetched: ${diff.length} characters`);
            // Fetch files changed
            console.log(`📁 Fetching changed files...`);
            const filesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'User-Agent': 'PullQuest-GitHub-Bot'
                }
            });
            console.log(`📊 GitHub Files API Response:`, {
                status: filesResponse.status,
                statusText: filesResponse.statusText,
                ok: filesResponse.ok
            });
            const files = await filesResponse.json();
            console.log(`✅ Files fetched: ${Array.isArray(files) ? files.length : 'invalid'} files`);
            const result = {
                title: prData.title || 'No title',
                description: prData.body || '',
                author: prData.user.login,
                diff,
                files,
                additions: prData.additions || 0,
                deletions: prData.deletions || 0,
                changedFiles: prData.changed_files || 0
            };
            console.log(`🎉 PR data compilation complete:`, {
                title: result.title,
                author: result.author,
                additions: result.additions,
                deletions: result.deletions,
                changedFiles: result.changedFiles,
                diffLength: result.diff.length,
                filesCount: Array.isArray(result.files) ? result.files.length : 0
            });
            return result;
        }
        catch (error) {
            console.error('❌ Error fetching PR data:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                owner,
                repo,
                prNumber
            });
            throw error;
        }
    }
    async generateAIReview(prData) {
        console.log(`🤖 Starting AI review generation for PR: ${prData.title}`);
        console.log(`📊 PR Stats:`, {
            author: prData.author,
            changedFiles: prData.changedFiles,
            additions: prData.additions,
            deletions: prData.deletions,
            diffLength: prData.diff?.length || 0
        });
        const startTime = Date.now();
        try {
            const prompt = prompts_1.PromptTemplate.fromTemplate(`
You are a senior blockchain developer and code reviewer specializing in decentralized applications.

Analyze this Pull Request and provide a comprehensive review:

PR Title: {title}
Description: {description}
Author: {author}
Files Changed: {changedFiles}
Lines Added: {additions}
Lines Deleted: {deletions}

Code Changes:
{diff}

Provide your analysis in the following format:
{format_instructions}

Focus on:
1. Code quality and security (especially for blockchain interactions)
2. Token reward amount (0-1000 tokens based on contribution value)
3. Whether this deserves an NFT mint (significant contributions only)
4. Risk assessment for smart contract/blockchain code
5. Actionable recommendations

Consider factors like:
- Smart contract security
- Gas optimization
- Blockchain best practices
- DeFi protocols integration
- Innovation and creativity
- Testing coverage
- Documentation quality
`);
            console.log(`📝 Creating prompt template and chain...`);
            const chain = prompt.pipe(llm).pipe(prReviewParser);
            const promptData = {
                title: prData.title,
                description: prData.description,
                author: prData.author,
                changedFiles: prData.changedFiles,
                additions: prData.additions,
                deletions: prData.deletions,
                diff: prData.diff.substring(0, 8000), // Truncate for token limits
                format_instructions: prReviewParser.getFormatInstructions()
            };
            console.log(`🚀 Invoking AI chain with data:`, {
                title: promptData.title,
                author: promptData.author,
                changedFiles: promptData.changedFiles,
                diffTruncated: promptData.diff.length,
                formatInstructionsLength: promptData.format_instructions.length
            });
            const result = await chain.invoke(promptData);
            const processingTime = Date.now() - startTime;
            console.log(`✅ AI review completed in ${processingTime}ms:`, {
                qualityScore: result.qualityScore,
                tokenReward: result.tokenReward,
                shouldMint: result.shouldMint,
                riskLevel: result.riskLevel,
                summaryLength: result.summary?.length || 0,
                recommendationsCount: result.recommendations?.length || 0
            });
            return result;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ AI review generation failed after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                prData: {
                    title: prData.title,
                    author: prData.author,
                    diffLength: prData.diff?.length || 0
                }
            });
            throw error;
        }
    }
    async recordReviewOnHedera(review, prData) {
        console.log(`⛓️ Recording review on Hedera for PR: ${prData.title}`);
        const startTime = Date.now();
        try {
            // Create immutable record of the review on Hedera Consensus Service
            const reviewRecord = {
                timestamp: new Date().toISOString(),
                prAuthor: prData.author,
                prTitle: prData.title,
                qualityScore: review.qualityScore,
                tokenReward: review.tokenReward,
                reviewSummary: review.summary,
                aiReviewer: "hedera-ai-agent",
                riskLevel: review.riskLevel
            };
            console.log(`📝 Created review record:`, {
                timestamp: reviewRecord.timestamp,
                prAuthor: reviewRecord.prAuthor,
                qualityScore: reviewRecord.qualityScore,
                tokenReward: reviewRecord.tokenReward,
                riskLevel: reviewRecord.riskLevel,
                summaryLength: reviewRecord.reviewSummary?.length || 0
            });
            // Submit to Hedera Consensus Service for immutable audit trail
            const message = JSON.stringify(reviewRecord);
            console.log(`📤 Submitting message to Hedera topic: ${process.env.HEDERA_TOPIC_ID}, length: ${message.length}`);
            const hederaAgent = await this.getHederaAgent();
            const transaction = await hederaAgent.submitMessageToTopic(process.env.HEDERA_TOPIC_ID, // Your review audit topic
            message);
            const processingTime = Date.now() - startTime;
            console.log(`✅ Review recorded on Hedera in ${processingTime}ms:`, {
                transactionId: transaction.transactionId,
                consensusTimestamp: transaction.consensusTimestamp,
                messageLength: message.length
            });
            return {
                transactionId: transaction.transactionId,
                consensusTimestamp: transaction.consensusTimestamp,
                record: reviewRecord
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Failed to record review on Hedera after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                prData: {
                    title: prData.title,
                    author: prData.author
                },
                review: {
                    qualityScore: review.qualityScore,
                    riskLevel: review.riskLevel
                }
            });
            throw error;
        }
    }
    async rewardContributor(contributor, tokenAmount) {
        console.log(`🪙 Processing token reward for contributor: ${contributor}, amount: ${tokenAmount}`);
        const startTime = Date.now();
        try {
            // Transfer reward tokens to contributor
            // First, get the contributor's Hedera account (you'd need a mapping service)
            console.log(`🔍 Looking up Hedera account for GitHub user: ${contributor}`);
            const contributorAccountId = await this.getHederaAccountForGithubUser(contributor);
            if (!contributorAccountId) {
                console.log(`⚠️ No Hedera account found for ${contributor} - skipping token transfer`);
                return null;
            }
            console.log(`✅ Found Hedera account for ${contributor}: ${contributorAccountId}`);
            console.log(`💸 Initiating token transfer:`, {
                tokenId: process.env.HEDERA_REWARD_TOKEN_ID,
                recipient: contributorAccountId,
                amount: tokenAmount
            });
            const hederaAgent = await this.getHederaAgent();
            const transfer = await hederaAgent.transferToken(process.env.HEDERA_REWARD_TOKEN_ID, // Your reward token
            contributorAccountId, tokenAmount);
            const processingTime = Date.now() - startTime;
            console.log(`✅ Token transfer completed in ${processingTime}ms:`, {
                transactionId: transfer.transactionId,
                recipient: contributorAccountId,
                amount: tokenAmount
            });
            return transfer;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Token transfer failed after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                contributor,
                tokenAmount
            });
            return null;
        }
    }
    async updateContributorReputation(githubUsername, qualityScore) {
        console.log(`📊 Updating contributor reputation for: ${githubUsername}, new score: ${qualityScore}`);
        const startTime = Date.now();
        try {
            // Fetch contributor's history from your database or Hedera records
            console.log(`📖 Fetching contributor history for: ${githubUsername}`);
            const historyStart = Date.now();
            const contributorHistory = await this.fetchContributorHistory(githubUsername);
            const historyTime = Date.now() - historyStart;
            console.log(`✅ Contributor history fetched in ${historyTime}ms:`, {
                currentContributions: contributorHistory.contributions,
                currentTotalQuality: contributorHistory.totalQuality,
                lastContribution: contributorHistory.lastContribution
            });
            // Update reputation based on new score
            const updatedReputation = {
                totalContributions: contributorHistory.contributions + 1,
                averageQuality: (contributorHistory.totalQuality + qualityScore) / (contributorHistory.contributions + 1),
                lastContribution: new Date().toISOString(),
                reputationScore: this.calculateReputationScore(contributorHistory, qualityScore)
            };
            console.log(`📈 Calculated updated reputation:`, updatedReputation);
            // Store updated reputation on Hedera
            console.log(`⛓️ Recording reputation update on Hedera...`);
            const hederaStart = Date.now();
            const hederaAgent = await this.getHederaAgent();
            const reputationMessage = JSON.stringify({ githubUsername, ...updatedReputation });
            console.log(`📤 Submitting reputation update to topic: ${process.env.HEDERA_REPUTATION_TOPIC_ID}`);
            const reputationRecord = await hederaAgent.submitMessageToTopic(process.env.HEDERA_REPUTATION_TOPIC_ID, reputationMessage);
            const hederaTime = Date.now() - hederaStart;
            const totalTime = Date.now() - startTime;
            console.log(`✅ Reputation update completed in ${totalTime}ms (Hedera: ${hederaTime}ms):`, {
                transactionId: reputationRecord.transactionId,
                newReputationScore: updatedReputation.reputationScore,
                newTotalContributions: updatedReputation.totalContributions
            });
            return updatedReputation;
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ Reputation update failed after ${totalTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                githubUsername,
                qualityScore
            });
            throw error;
        }
    }
    async assessContributorReputation(contributorStats) {
        console.log(`🔍 Assessing contributor reputation for: ${contributorStats.login || contributorStats.username}`);
        console.log(`📊 Contributor stats:`, {
            username: contributorStats.login || contributorStats.username,
            publicRepos: contributorStats.public_repos,
            followers: contributorStats.followers,
            following: contributorStats.following,
            createdAt: contributorStats.created_at
        });
        const startTime = Date.now();
        try {
            const prompt = prompts_1.PromptTemplate.fromTemplate(`
Analyze this GitHub contributor's profile and assess their reputation for our decentralized development community:

GitHub Stats:
- Username: {username}
- Public Repos: {publicRepos}
- Followers: {followers}
- Following: {following}
- Total Commits (last year): {commits}
- Pull Requests: {pullRequests}
- Issues Created: {issues}
- Account Age: {accountAge} years
- Languages: {languages}

Recent Activity:
{recentActivity}

Provide reputation assessment in the following format:
{format_instructions}

Consider:
1. Contribution consistency and quality
2. Community engagement
3. Technical expertise across languages
4. Open source commitment
5. Leadership and mentoring indicators
`);
            console.log(`🤖 Creating AI chain for reputation assessment...`);
            const chain = prompt.pipe(llm).pipe(reputationParser);
            const promptData = {
                username: contributorStats.login || contributorStats.username || 'Unknown',
                publicRepos: contributorStats.public_repos || 0,
                followers: contributorStats.followers || 0,
                following: contributorStats.following || 0,
                commits: contributorStats.commits || 0,
                pullRequests: contributorStats.pullRequests || 0,
                issues: contributorStats.issues || 0,
                accountAge: contributorStats.accountAge || 0,
                languages: contributorStats.languages?.join(', ') || 'Unknown',
                recentActivity: contributorStats.recentActivity || 'Limited data',
                format_instructions: reputationParser.getFormatInstructions()
            };
            console.log(`🚀 Invoking reputation assessment chain...`);
            const result = await chain.invoke(promptData);
            const processingTime = Date.now() - startTime;
            console.log(`✅ Reputation assessment completed in ${processingTime}ms:`, {
                reputationScore: result.reputationScore,
                contributions: result.contributions,
                qualityAverage: result.qualityAverage,
                trustLevel: result.trustLevel,
                recommendedRole: result.recommendedRole
            });
            return result;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Reputation assessment failed after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                contributorStats: {
                    username: contributorStats.login || contributorStats.username,
                    publicRepos: contributorStats.public_repos
                }
            });
            throw error;
        }
    }
    async generateNFTMetadata(username, reputation) {
        console.log(`🎨 Generating NFT metadata for: ${username}`);
        console.log(`📊 Reputation data:`, {
            trustLevel: reputation.trustLevel,
            reputationScore: reputation.reputationScore,
            contributions: reputation.contributions,
            recommendedRole: reputation.recommendedRole
        });
        const startTime = Date.now();
        try {
            const metadata = {
                name: `${username} - ${reputation.trustLevel} Contributor`,
                description: `GitHub contributor NFT for ${username}. Trust Level: ${reputation.trustLevel}. Reputation Score: ${reputation.reputationScore}/100`,
                image: `https://your-nft-api.com/generate-avatar/${username}/${reputation.trustLevel}`,
                attributes: [
                    { trait_type: "Trust Level", value: reputation.trustLevel },
                    { trait_type: "Reputation Score", value: reputation.reputationScore.toString() },
                    { trait_type: "Total Contributions", value: reputation.contributions.toString() },
                    { trait_type: "Quality Average", value: reputation.qualityAverage.toString() },
                    { trait_type: "Recommended Role", value: reputation.recommendedRole },
                    { trait_type: "GitHub Username", value: username }
                ]
            };
            const processingTime = Date.now() - startTime;
            console.log(`✅ NFT metadata generated in ${processingTime}ms:`, {
                name: metadata.name,
                attributeCount: metadata.attributes.length,
                imageUrl: metadata.image
            });
            return metadata;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ NFT metadata generation failed after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                username,
                reputation
            });
            throw error;
        }
    }
    async postAICommentToGithub(owner, repo, prNumber, review, hederaTransactionId, githubToken) {
        console.log(`💬 Posting AI comment to GitHub: ${owner}/${repo}#${prNumber}`);
        console.log(`📊 Review summary:`, {
            qualityScore: review.qualityScore,
            riskLevel: review.riskLevel,
            shouldMint: review.shouldMint,
            tokenReward: review.tokenReward,
            recommendationsCount: review.recommendations?.length || 0
        });
        const startTime = Date.now();
        try {
            const comment = `
# 🤖 AI Code Review (Powered by Hedera)

## 📊 Quality Assessment
**Score: ${review.qualityScore}/100** ${this.getScoreEmoji(review.qualityScore)}

**Risk Level: ${review.riskLevel}** ${this.getRiskEmoji(review.riskLevel)}

## 📝 AI Summary
${review.summary}

## 💡 Recommendations
${review.recommendations.map((rec) => `- ${rec}`).join('\n')}

## 🏆 Rewards
${review.shouldMint ? `✅ **Eligible for Contributor NFT**` : '❌ Not eligible for NFT this time'}
${review.tokenReward > 0 ? `🪙 **Token Reward: ${review.tokenReward} tokens**` : '🪙 No token reward'}

## 🔗 Hedera Blockchain Record
**Transaction ID:** \`${hederaTransactionId}\`
*This review is permanently recorded on Hedera for transparency and auditability.*

---
*Powered by AI + Hedera Agent Kit | [Learn More](https://hedera.com)*
`;
            console.log(`📝 Generated comment (${comment.length} characters)`);
            console.log(`🔑 Using GitHub token for comment posting`);
            const token = githubToken || process.env.GITHUB_COMMENT_TOKEN;
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    'User-Agent': 'PullQuest-GitHub-Bot'
                },
                body: JSON.stringify({ body: comment }),
            });
            const processingTime = Date.now() - startTime;
            console.log(`📊 GitHub comment API response:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                processingTime
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Failed to post comment:`, {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error(`GitHub comment API error: ${response.status} - ${response.statusText}`);
            }
            const commentData = await response.json();
            console.log(`✅ AI comment posted successfully in ${processingTime}ms:`, {
                commentId: commentData.id,
                commentUrl: commentData.html_url
            });
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Failed to post AI comment after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                repo: `${owner}/${repo}#${prNumber}`
            });
            throw error;
        }
    }
    // ===== UTILITY METHODS =====
    getScoreEmoji(score) {
        console.log(`🎯 Getting score emoji for score: ${score}`);
        if (score >= 90)
            return '🏆';
        if (score >= 75)
            return '⭐';
        if (score >= 60)
            return '👍';
        if (score >= 40)
            return '⚠️';
        return '❌';
    }
    getRiskEmoji(risk) {
        console.log(`⚡ Getting risk emoji for risk level: ${risk}`);
        switch (risk) {
            case 'LOW': return '🟢';
            case 'MEDIUM': return '🟡';
            case 'HIGH': return '🔴';
            default: return '⚪';
        }
    }
    calculateReputationScore(history, newScore) {
        console.log(`🧮 Calculating reputation score:`, {
            currentContributions: history.contributions,
            currentTotalQuality: history.totalQuality,
            newScore
        });
        // Implement your reputation calculation logic
        const baseScore = (history.totalQuality || 0) / Math.max(history.contributions || 1, 1);
        const consistencyBonus = history.contributions > 10 ? 10 : 0;
        const recentActivityBonus = newScore > 80 ? 5 : 0;
        const finalScore = Math.min(100, Math.round(baseScore + consistencyBonus + recentActivityBonus));
        console.log(`📊 Reputation calculation result:`, {
            baseScore,
            consistencyBonus,
            recentActivityBonus,
            finalScore
        });
        return finalScore;
    }
    async getHederaAccountForGithubUser(githubUsername) {
        console.log(`🔍 Looking up Hedera account for GitHub user: ${githubUsername}`);
        // Implement mapping between GitHub users and Hedera accounts
        // This could be stored in your database or on Hedera itself
        console.log(`⚠️ No Hedera account mapping found for: ${githubUsername} (placeholder implementation)`);
        return null; // Placeholder
    }
    async fetchContributorHistory(githubUsername) {
        console.log(`📖 Fetching contributor history for: ${githubUsername}`);
        // Fetch from your database or Hedera topic
        const history = {
            contributions: 0,
            totalQuality: 0,
            lastContribution: null
        };
        console.log(`📊 Contributor history (placeholder):`, history);
        return history;
    }
    async fetchContributorStats(githubUsername) {
        console.log(`👤 Fetching GitHub stats for user: ${githubUsername}`);
        const startTime = Date.now();
        const token = process.env.GITHUB_COMMENT_TOKEN;
        try {
            console.log(`🌐 Making GitHub API request for user data...`);
            const response = await fetch(`https://api.github.com/users/${githubUsername}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'User-Agent': 'PullQuest-GitHub-Bot'
                }
            });
            const processingTime = Date.now() - startTime;
            console.log(`📊 GitHub user API response:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                processingTime
            });
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
            }
            const userData = await response.json();
            console.log(`✅ GitHub user data fetched successfully:`, {
                username: userData.login,
                publicRepos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
                createdAt: userData.created_at
            });
            return userData;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Failed to fetch GitHub user stats after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                githubUsername
            });
            throw error;
        }
    }
    async analyzeIssueComplexity(issueUrl) {
        console.log(`🔍 Analyzing issue complexity for: ${issueUrl}`);
        const startTime = Date.now();
        try {
            // Implementation for analyzing GitHub issues with AI
            // Return complexity analysis and recommended bounty amount
            const analysis = {
                complexity: "MEDIUM",
                recommendedBounty: 500,
                estimatedHours: 8
            };
            const processingTime = Date.now() - startTime;
            console.log(`✅ Issue analysis completed in ${processingTime}ms:`, analysis);
            return analysis;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Issue analysis failed after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                issueUrl
            });
            throw error;
        }
    }
    async deployBountyContract(bountyAmount, requirements, analysis) {
        console.log(`📄 Deploying bounty contract:`, {
            bountyAmount,
            requirementsCount: requirements?.length || 0,
            analysis
        });
        const startTime = Date.now();
        try {
            // Deploy smart contract for bounty escrow
            // This would use Hedera smart contracts
            const contract = {
                contractId: "0.0.123456",
                bountyAmount,
                requirements
            };
            const processingTime = Date.now() - startTime;
            console.log(`✅ Bounty contract deployed in ${processingTime}ms:`, {
                contractId: contract.contractId,
                bountyAmount: contract.bountyAmount
            });
            return contract;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Bounty contract deployment failed after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                bountyAmount,
                requirements
            });
            throw error;
        }
    }
    // Add the missing recordSessionOnHedera method
    async recordSessionOnHedera(sessionData) {
        console.log(`📝 Recording session on Hedera:`, {
            sessionDataKeys: Object.keys(sessionData),
            timestamp: sessionData.timestamp
        });
        const startTime = Date.now();
        try {
            const hederaAgent = await this.getHederaAgent();
            const message = JSON.stringify(sessionData);
            console.log(`📤 Submitting session data to Hedera topic: ${process.env.HEDERA_TOPIC_ID}`);
            console.log(`📊 Message length: ${message.length} characters`);
            const transaction = await hederaAgent.submitMessageToTopic(process.env.HEDERA_TOPIC_ID, // Your session audit topic
            message);
            const processingTime = Date.now() - startTime;
            console.log(`✅ Session recorded on Hedera successfully in ${processingTime}ms:`, {
                transactionId: transaction.transactionId,
                consensusTimestamp: transaction.consensusTimestamp
            });
            return {
                transactionId: transaction.transactionId,
                consensusTimestamp: transaction.consensusTimestamp,
                record: sessionData
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Failed to record session on Hedera after ${processingTime}ms:`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                sessionData: {
                    keys: Object.keys(sessionData),
                    timestamp: sessionData.timestamp
                }
            });
            throw new Error("Could not record session on Hedera");
        }
    }
}
exports.HederaGithubService = HederaGithubService;
// Export controller instance
console.log("🏭 Creating HederaGithubService instance...");
exports.hederaGithubService = new HederaGithubService();
console.log("✅ HederaGithubService instance created and exported successfully");
//# sourceMappingURL=HederaGithubController.js.map