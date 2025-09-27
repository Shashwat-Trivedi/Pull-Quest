export interface IssueCommentResponse {
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    body: string;
    user: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        html_url: string;
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
    issue_url: string;
    author_association: string;
    [key: string]: any;
}
export interface ReviewCommentResponse {
    id: number;
    node_id: string;
    url: string;
    body: string;
    user: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        html_url: string;
        [key: string]: any;
    };
    commit_id: string;
    path: string;
    side: "LEFT" | "RIGHT";
    line: number;
    start_line?: number;
    start_side?: "LEFT" | "RIGHT";
    created_at: string;
    updated_at: string;
    pull_request_url: string;
    [key: string]: any;
}
export declare function postIssueComment(owner: string, repo: string, issueNumber: number, commentBody: string): Promise<IssueCommentResponse>;
export declare function postPullRequestComment(owner: string, repo: string, pullNumber: number, commentBody: string): Promise<IssueCommentResponse>;
export declare function postPullRequestReviewComment(owner: string, repo: string, pullNumber: number, commitId: string, path: string, line: number, side: "LEFT" | "RIGHT", commentBody: string, diff: string): Promise<ReviewCommentResponse>;
export declare function postPRFormComment(owner: string, repo: string, issueNumber: number, commentBody: string): Promise<IssueCommentResponse>;
export declare function fetchCompleteIssueData(owner: string, repo: string, issueNumber: number): Promise<any>;
export declare function fetchPRDetails(owner: string, repo: string, prNumber: number): Promise<any>;
export declare function getCorrectCommitSha(owner: string, repo: string, prNumber: number): Promise<string>;
