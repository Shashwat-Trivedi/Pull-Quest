import { Request, Response } from "express";
import { Octokit } from "@octokit/rest";
import axios from "axios";

export class ContributorController {
  /**
   * Get contributor profile and stats
   */
  async getContributorProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("🚀 ContributorController.getContributorProfile called");
      const { accessToken } = req.body;
      console.log("🔑 Received accessToken:", accessToken ? "Present" : "Missing");

      if (!accessToken) {
        console.log("❌ No access token provided");
        res.status(400).json({
          success: false,
          message: "GitHub access token is required"
        });
        return;
      }

      // Initialize Octokit with the user's access token
      console.log("🐙 Initializing Octokit...");
      const octokit = new Octokit({
        auth: accessToken,
      });

      // Get user's GitHub profile
      console.log("👤 Fetching GitHub profile...");
      const { data: profile } = await octokit.rest.users.getAuthenticated();
      console.log("✅ GitHub profile fetched:", profile.login);

      // Get user's repositories
      console.log("📚 Fetching repositories...");
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
      });
      console.log("✅ Repositories fetched:", repos.length);

      // Calculate basic stats
      const stats = {
        coins: Math.floor(Math.random() * 1000), // Temporary mock data
        xp: Math.floor(Math.random() * 5000), // Temporary mock data  
        rank: this.calculateRank(Math.floor(Math.random() * 5000)),
        nextRankXP: 1000,
        repositories: repos.length,
        mergedPRs: Math.floor(Math.random() * 50), // You'd get this from PR data
        activeBounties: Math.floor(Math.random() * 10),
      };

      console.log("📊 Stats calculated:", stats);

      res.status(200).json({
        success: true,
        data: {
          profile: {
            id: profile.id.toString(),
            login: profile.login,
            name: profile.name,
            email: profile.email,
            bio: profile.bio,
            location: profile.location,
            avatar_url: profile.avatar_url,
            public_repos: profile.public_repos,
            followers: profile.followers,
            following: profile.following,
          },
          stats,
        }
      });
    } catch (error: any) {
      console.error("❌ Error fetching contributor profile:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contributor profile",
        error: error.message,
      });
    }
  }

  /**
   * Analyze user repositories and find suggested issues
   */
  async analyzeUserRepositories(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        res.status(400).json({
          success: false,
          message: "GitHub access token is required"
        });
        return;
      }

      const octokit = new Octokit({
        auth: accessToken,
      });

      // Get user's repositories
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 50,
      });

      // Get languages used by the user
      const languages = new Set<string>();
      for (const repo of repos.slice(0, 10)) { // Analyze first 10 repos
        if (repo.language) {
          languages.add(repo.language);
        }
      }

      res.status(200).json({
        success: true,
        message: "Repository analysis completed successfully",
        data: {
          analyzedRepos: repos.length,
          languages: Array.from(languages),
        }
      });
    } catch (error: any) {
      console.error("Error analyzing repositories:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze repositories",
        error: error.message,
      });
    }
  }

  /**
   * Get suggested issues based on user's skills and interests
   */
  async getSuggestedIssues(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        res.status(400).json({
          success: false,
          message: "GitHub access token is required"
        });
        return;
      }

      console.log("🎯 Fetching suggested issues from bounty database...");

      // Import the required models
      const MaintainerIssue = require("../model/MaintainerIssues").default;

      // Fetch bounty issues from the database (open issues with bounties/stakes)
      const bountyIssues = await MaintainerIssue.find({
        state: "open", // Only open issues
        $or: [
          { 'labels.name': { $regex: /^bounty-\d+ℏ?$/i } },
          { 'labels.name': { $regex: /^stake-\d+ℏ?$/i } },
          { bounty: { $exists: true, $ne: null, $gt: 0 } },
          { stakingRequired: { $gt: 0 } }
        ]
      })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20) // Limit to 20 suggestions
      .lean();

      console.log(`✅ Found ${bountyIssues.length} bounty issues in database`);

      // Transform the data to match frontend expectations
      const transformedIssues = bountyIssues.map((issue: any) => {
        // Extract bounty and stake amounts from labels
        const bountyAmount = this.extractAmountFromLabels(issue.labels, 'bounty') || issue.bounty || 0;
        const stakeAmount = this.extractAmountFromLabels(issue.labels, 'stake') || issue.stakingRequired || 0;
        
        // Determine difficulty based on labels or default to beginner
        let difficulty = "beginner";
        if (issue.difficulty) {
          difficulty = issue.difficulty;
        } else if (issue.labels) {
          const difficultyLabel = issue.labels.find((label: any) => 
            ['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'].includes(label.name.toLowerCase())
          );
          if (difficultyLabel) {
            const labelName = difficultyLabel.name.toLowerCase();
            if (['easy', 'beginner'].includes(labelName)) difficulty = "beginner";
            else if (['medium', 'intermediate'].includes(labelName)) difficulty = "intermediate";
            else if (['hard', 'advanced', 'expert'].includes(labelName)) difficulty = "advanced";
          }
        }

        return {
          id: issue._id?.toString() || issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body || "No description provided.",
          repository: {
            name: issue.repository?.name || "Unknown",
            fullName: issue.repository?.fullName || "unknown/unknown",
            htmlUrl: issue.repository?.htmlUrl || "#",
            stargazersCount: issue.repository?.stargazersCount || 0,
            language: issue.repository?.language || "Unknown",
          },
          labels: issue.labels?.map((label: any) => ({
            name: label.name,
            color: label.color,
          })) || [],
          difficulty: difficulty as "beginner" | "intermediate" | "advanced",
          bounty: bountyAmount,
          xpReward: issue.xpReward || Math.floor(bountyAmount * 0.5), // Calculate XP as 50% of bounty
          stakingRequired: stakeAmount,
          htmlUrl: issue.htmlUrl,
          createdAt: new Date(issue.createdAt).toISOString(),
        };
      });

      res.status(200).json({
        success: true,
        data: {
          issues: transformedIssues,
        }
      });
    } catch (error: any) {
      console.error("❌ Error fetching suggested issues:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch suggested issues",
        error: error.message,
      });
    }
  }

  /**
   * Get detailed information about a specific issue
   */
  async getIssueDetails(req: Request, res: Response): Promise<void> {
    try {
      const { issueId } = req.params;
      
      // Mock implementation - in reality, you'd fetch from your database or GitHub
      res.status(200).json({
        success: true,
        data: {
          id: issueId,
          title: "Sample Issue",
          description: "This is a sample issue description",
          bounty: 100,
          difficulty: "beginner",
        }
      });
    } catch (error: any) {
      console.error("Error fetching issue details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch issue details",
        error: error.message,
      });
    }
  }

  /**
   * Prepare stake for an issue
   */
  async prepareStake(req: Request, res: Response): Promise<void> {
    try {
      const { issueId, amount } = req.body;
      
      // Mock implementation
      res.status(200).json({
        success: true,
        message: "Stake prepared successfully",
        data: {
          issueId,
          amount,
          status: "prepared"
        }
      });
    } catch (error: any) {
      console.error("Error preparing stake:", error);
      res.status(500).json({
        success: false,
        message: "Failed to prepare stake",
        error: error.message,
      });
    }
  }

  /**
   * Helper method to extract bounty/stake amounts from labels
   */
  private extractAmountFromLabels(labels: any[], type: 'bounty' | 'stake'): number {
    if (!labels || !Array.isArray(labels)) return 0;
    
    const regex = type === 'bounty' 
      ? /^bounty-(\d+)ℏ?$/i 
      : /^stake-(\d+)ℏ?$/i;
    
    for (const label of labels) {
      const match = label.name?.match(regex);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 0;
  }

  /**
   * Calculate user rank based on XP
   */
  private calculateRank(xp: number): string {
    if (xp >= 5000) return "Open Source Legend";
    if (xp >= 3000) return "Code Expert";
    if (xp >= 2000) return "Code Master";
    if (xp >= 1000) return "Code Contributor";
    if (xp >= 500) return "Code Apprentice";
    return "Code Novice";
  }
}