import { Request, Response } from "express";
interface ContributorNFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: {
        trait_type: string;
        value: string;
    }[];
}
export declare class HederaGithubService {
    private getHederaAgent;
    /**
     * Main endpoint - AI-powered PR review with Hedera rewards
     */
    handleAIPRReview(req: Request, res: Response): Promise<void>;
    /**
     * Mint contributor achievement NFTs based on GitHub activity
     */
    mintContributorNFT(req: Request, res: Response): Promise<void>;
    createBountyWithAI(req: Request, res: Response): Promise<void>;
    fetchPRData(owner: string, repo: string, prNumber: number, githubToken?: string): Promise<{
        title: any;
        description: any;
        author: any;
        diff: string;
        files: any;
        additions: any;
        deletions: any;
        changedFiles: any;
    }>;
    generateAIReview(prData: any): Promise<{
        summary: string;
        recommendations: string[];
        qualityScore: number;
        tokenReward: number;
        shouldMint: boolean;
        riskLevel: "LOW" | "MEDIUM" | "HIGH";
    }>;
    recordReviewOnHedera(review: any, prData: any): Promise<{
        transactionId: string;
        consensusTimestamp: string;
        record: {
            timestamp: string;
            prAuthor: any;
            prTitle: any;
            qualityScore: any;
            tokenReward: any;
            reviewSummary: any;
            aiReviewer: string;
            riskLevel: any;
        };
    }>;
    rewardContributor(contributor: string, tokenAmount: number): Promise<{
        transactionId: string;
    } | null>;
    updateContributorReputation(githubUsername: string, qualityScore: number): Promise<{
        totalContributions: any;
        averageQuality: number;
        lastContribution: string;
        reputationScore: number;
    }>;
    assessContributorReputation(contributorStats: any): Promise<{
        reputationScore: number;
        contributions: number;
        qualityAverage: number;
        trustLevel: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
        recommendedRole: string;
    }>;
    generateNFTMetadata(username: string, reputation: any): Promise<ContributorNFTMetadata>;
    postAICommentToGithub(owner: string, repo: string, prNumber: number, review: any, hederaTransactionId: string, githubToken?: string): Promise<void>;
    getScoreEmoji(score: number): string;
    getRiskEmoji(risk: string): string;
    calculateReputationScore(history: any, newScore: number): number;
    getHederaAccountForGithubUser(githubUsername: string): Promise<string | null>;
    fetchContributorHistory(githubUsername: string): Promise<any>;
    fetchContributorStats(githubUsername: string): Promise<any>;
    analyzeIssueComplexity(issueUrl: string): Promise<any>;
    deployBountyContract(bountyAmount: number, requirements: string[], analysis: any): Promise<any>;
    recordSessionOnHedera(sessionData: any): Promise<{
        transactionId: string;
        consensusTimestamp: string;
        record: any;
    }>;
}
export declare const hederaGithubService: HederaGithubService;
export {};
