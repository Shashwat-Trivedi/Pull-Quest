import mongoose, { Document, Types } from "mongoose";
export interface IIssueLabel {
    id: number;
    name: string;
    color: string;
    description?: string;
}
export interface IIssueUser {
    id: number;
    login: string;
    avatarUrl: string;
    htmlUrl: string;
    type: string;
}
export interface IIssue {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: string;
    htmlUrl: string;
    user: IIssueUser;
    labels: IIssueLabel[];
    assignee?: IIssueUser;
    assignees: IIssueUser[];
    milestone?: {
        id: number;
        title: string;
        description?: string;
        state: string;
        dueOn?: Date;
    };
    commentsCount: number;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
    authorAssociation: string;
    repository: {
        id: number;
        name: string;
        fullName: string;
        htmlUrl: string;
        language?: string;
        stargazersCount: number;
        forksCount: number;
        description?: string;
    };
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedHours?: number;
    bounty?: number;
    xpReward?: number;
    stakingRequired?: number;
    expirationDate?: Date;
}
export interface IGitHubIssues extends Document {
    userId: Types.ObjectId;
    githubUsername: string;
    suggestedIssues: IIssue[];
    userTopLanguages: string[];
    userOrganizations: string[];
    lastFetched: Date;
    filters: {
        languages: string[];
        labels: string[];
        difficulty?: string;
        minStars?: number;
        minBounty?: number;
        maxBounty?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IGitHubIssues, {}, {}, {}, mongoose.Document<unknown, {}, IGitHubIssues, {}, {}> & IGitHubIssues & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
