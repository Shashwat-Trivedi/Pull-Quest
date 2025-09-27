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

      // For now, return mock data. In a real implementation, you would:
      // 1. Analyze user's skills from their repositories
      // 2. Search for issues in popular repositories matching their skills
      // 3. Filter by difficulty and bounty information

      const mockIssues = [
        {
          id: 1,
          number: 123,
          title: "Add dark mode support to dashboard",
          body: "We need to implement a dark mode toggle for better user experience...",
          repository: {
            name: "awesome-project",
            fullName: "owner/awesome-project",
            htmlUrl: "https://github.com/owner/awesome-project",
            stargazersCount: 1500,
            language: "TypeScript",
          },
          labels: [
            { name: "enhancement", color: "84cc16" },
            { name: "good first issue", color: "22c55e" },
          ],
          difficulty: "beginner" as const,
          bounty: 100,
          xpReward: 50,
          stakingRequired: 25,
          htmlUrl: "https://github.com/owner/awesome-project/issues/123",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          number: 456,
          title: "Implement user authentication with JWT",
          body: "Need to add secure user authentication using JWT tokens...",
          repository: {
            name: "backend-api",
            fullName: "company/backend-api",
            htmlUrl: "https://github.com/company/backend-api",
            stargazersCount: 800,
            language: "JavaScript",
          },
          labels: [
            { name: "security", color: "ef4444" },
            { name: "backend", color: "3b82f6" },
          ],
          difficulty: "intermediate" as const,
          bounty: 250,
          xpReward: 150,
          stakingRequired: 50,
          htmlUrl: "https://github.com/company/backend-api/issues/456",
          createdAt: new Date().toISOString(),
        },
      ];

      res.status(200).json({
        success: true,
        data: {
          issues: mockIssues,
        }
      });
    } catch (error: any) {
      console.error("Error fetching suggested issues:", error);
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