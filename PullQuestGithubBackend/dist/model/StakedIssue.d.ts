import mongoose, { Document } from "mongoose";
interface IUser {
    id: number;
    login: string;
    avatarUrl: string;
    htmlUrl: string;
    type: string;
}
interface ILabel {
    id: number;
    name: string;
    color: string;
    description: string;
}
interface IMilestone {
    id: number;
    title: string;
    description: string;
    state: string;
    dueOn?: Date;
}
interface IRepository {
    id: number;
    name: string;
    fullName: string;
    htmlUrl: string;
    language: string;
    stargazersCount: number;
    forksCount: number;
    description: string;
}
export interface IStakedIssue extends Document {
    issueId: number;
    issueNumber: number;
    title: string;
    body: string;
    state: string;
    htmlUrl: string;
    issueCreator: IUser;
    stakingUser: {
        userId: string;
        githubUsername: string;
        githubId: number;
        avatarUrl: string;
    };
    labels: ILabel[];
    milestone?: IMilestone;
    repository: IRepository;
    stakeAmount: number;
    stakingDate: Date;
    status: "active" | "completed" | "refunded" | "expired";
    assignedTo?: IUser;
    prNumber?: number;
    prUrl?: string;
    xpReward?: number;
    bountyReward?: number;
    completedAt?: Date;
    refundedAt?: Date;
    difficulty?: string;
    estimatedHours?: number;
    commentsCount: number;
    authorAssociation: string;
    issueCreatedAt: Date;
    issueUpdatedAt: Date;
    issueClosedAt?: Date;
    expirationDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const StakedIssue: mongoose.Model<IStakedIssue, {}, {}, {}, mongoose.Document<unknown, {}, IStakedIssue, {}, {}> & IStakedIssue & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default StakedIssue;
