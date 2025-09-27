import { IUser } from '../model/User';
interface GitHubIssueData {
    id: number;
    number: number;
    title: string;
    body: string;
    state: string;
    html_url: string;
    user: {
        id: number;
        login: string;
        avatar_url: string;
        html_url: string;
        type: string;
    };
    labels: Array<{
        id: number;
        name: string;
        color: string;
        description: string;
    }>;
    milestone?: {
        id: number;
        title: string;
        description: string;
        state: string;
        due_on: string;
    };
    repository?: {
        id: number;
        language: string;
        stargazers_count: number;
        forks_count: number;
        description: string;
    };
    comments: number;
    author_association: string;
    created_at: string;
    updated_at: string;
    closed_at?: string;
}
interface StakeIngestionParams {
    issueData: GitHubIssueData;
    stakingUser: IUser;
    stakeAmount: number;
    prNumber: number;
    owner: string;
    repo: string;
}
/**
 * Ingests a staked issue into the database
 */
export declare function ingestStakedIssue(params: StakeIngestionParams): Promise<{
    success: boolean;
    stakedIssueId: unknown;
    message: string;
}>;
/**
 * Update staked issue when PR is completed/merged
 */
export declare function updateStakedIssueStatus(issueId: number, stakingUserId: string, status: 'completed' | 'refunded' | 'expired'): Promise<import("mongoose").Document<unknown, {}, import("../model/StakedIssue").IStakedIssue, {}, {}> & import("../model/StakedIssue").IStakedIssue & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export {};
