import { IUser } from '../model/User';
interface GitHubPRData {
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
    base?: {
        repo?: {
            id: number;
            language: string;
            stargazers_count: number;
            forks_count: number;
            description: string;
        };
    };
    additions: number;
    deletions: number;
    changed_files: number;
    comments: number;
    merged: boolean;
    created_at: string;
    updated_at: string;
    merged_at?: string;
    closed_at?: string;
}
interface MergedPRIngestionParams {
    prData: GitHubPRData;
    awardedUser: IUser;
    bonusXpAmount: number;
    awardedBy: string;
    owner: string;
    repo: string;
}
export declare function ingestMergedPR(params: MergedPRIngestionParams): Promise<{
    success: boolean;
    mergedPRId: unknown;
    message: string;
    isUpdate: boolean;
}>;
export {};
