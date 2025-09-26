export interface GitHubInfo {
  name?: string;
  avatar_url?: string;
  public_repos: number;
  followers: number;
  location?: string;
  bio?: string;
}

export interface RecentStake {
  title: string;
  status: string;
  xpEarned?: number;
  coinsEarned?: number;
  xpStaked?: number;
  coinsStaked?: number;
  coinsRequired?: number;
  type: "completed" | "pending" | "available";
}

export interface User {
  _id: string;
  email: string;
  role: string;
  githubUsername: string;
  xp: number;
  isActive: boolean;
  coins: number;
  weeklyCoinsEarned: number;
  lastLogin: string;
  createdAt: string;
  githubInfo: GitHubInfo;
  recentStakes?: RecentStake[];
  accessToken?: string; // Add this since it's used in login flow
  profile?: {
    name?: string;
    bio?: string;
    username?: string; // Add this since some components reference it
  };
}

export interface Rank {
  name: string;
  min: number;
  max: number;
  color: string;
}

export interface XPProgress {
  progress: number;
  xpToNext: number;
}

export interface DashboardFilters {
  searchTerm: string;
  sortOrder: "asc" | "desc";
  rankFilter: string;
  statusFilter: string;
}
