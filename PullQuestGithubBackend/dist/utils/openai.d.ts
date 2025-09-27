export interface ReviewCodeParams {
    code: string;
}
export interface ReviewCodeResponse {
    reply: string;
}
export declare function reviewCodeWithAI(params: ReviewCodeParams): Promise<ReviewCodeResponse>;
