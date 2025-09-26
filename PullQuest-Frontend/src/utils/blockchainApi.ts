// src/utils/blockchainApi.ts

const BLOCKCHAIN_API_URL = import.meta.env.VITE_BLOCKCHAIN_API_URL || "http://localhost:8000";

export interface CreateIssueRequest {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  stakeAmount: number;
  labels?: string[];
}

export interface CreateIssueResponse {
  success: boolean;
  data?: {
    number: string;
    title: string;
    html_url: string;
    txHash: string;
    stakeAmount: number;
    blockchainIssueId: string;
  };
  message?: string;
}

export interface IssueDetails {
  id: string;
  githubIssueUrl: string;
  title: string;
  description: string;
  creator: string;
  assignee: string;
  stakeAmount: string;
  bountyAmount: string;
  status: number;
  createdAt: string;
  resolvedAt: string;
  resolutionProof: string;
}

export class BlockchainAPI {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${BLOCKCHAIN_API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async createIssue(data: CreateIssueRequest): Promise<CreateIssueResponse> {
    return this.makeRequest<CreateIssueResponse>('/api/maintainer/create-issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addStake(issueId: string, stakeAmount: number) {
    return this.makeRequest('/api/maintainer/add-stake', {
      method: 'POST',
      body: JSON.stringify({ issueId, stakeAmount }),
    });
  }

  static async getIssue(issueId: string): Promise<{ success: boolean; data: IssueDetails }> {
    return this.makeRequest(`/api/maintainer/issue/${issueId}`);
  }

  static async getUserIssues(address: string): Promise<{ success: boolean; data: string[] }> {
    return this.makeRequest(`/api/maintainer/user-issues/${address}`);
  }

  static async assignIssue(issueId: string, assigneeAddress: string) {
    return this.makeRequest('/api/maintainer/assign-issue', {
      method: 'POST',
      body: JSON.stringify({ issueId, assigneeAddress }),
    });
  }

  static async getContractInfo() {
    return this.makeRequest('/api/contract/info');
  }

  static async healthCheck() {
    return this.makeRequest('/api/health');
  }
}

export enum IssueStatus {
  Open = 0,
  InProgress = 1,
  UnderReview = 2,
  Resolved = 3,
  Disputed = 4,
  Cancelled = 5
}

export const getStatusName = (status: number): string => {
  const statusNames = ['Open', 'In Progress', 'Under Review', 'Resolved', 'Disputed', 'Cancelled'];
  return statusNames[status] || 'Unknown';
};