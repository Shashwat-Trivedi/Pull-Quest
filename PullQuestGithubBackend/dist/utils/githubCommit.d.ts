export interface GitHubCommit {
    sha: string;
    html_url: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        tree: {
            sha: string;
            url: string;
        };
        comment_count: number;
    };
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    committer: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    parents: {
        sha: string;
        url: string;
    }[];
    files?: any[];
    stats?: {
        total: number;
        additions: number;
        deletions: number;
    };
}
export interface HeadCommitDetails extends GitHubCommit {
    /** Convenient alias (= same value as `sha`) */
    headSha: string;
}
export declare function fetchHeadCommitOfPR(owner: string, repo: string, pullNumber: number, extraFetchInit?: RequestInit): Promise<HeadCommitDetails>;
