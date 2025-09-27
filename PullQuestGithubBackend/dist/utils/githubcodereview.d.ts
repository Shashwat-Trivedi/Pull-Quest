export interface GitHubReviewParams {
    /** The unified diff text from a GitHub pull request */
    diff: string;
}
export interface GitHubReviewResponse {
    /** AI's review commentary suitable for posting on GitHub */
    review: string;
    /** Raw OpenAI response for debugging */
    raw: any;
}
export declare function reviewCodeForGitHub(params: GitHubReviewParams): Promise<GitHubReviewResponse>;
