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
export interface IMergedPR extends Document {
    prId: number;
    prNumber: number;
    title: string;
    body: string;
    state: string;
    htmlUrl: string;
    author: IUser;
    awardedUser: {
        userId: string;
        githubUsername: string;
        githubId: number;
        avatarUrl: string;
    };
    bonusXpAwarded: number;
    awardedBy: string;
    awardedAt: Date;
    repository: IRepository;
    labels: ILabel[];
    additions: number;
    deletions: number;
    changedFiles: number;
    commentsCount: number;
    prCreatedAt: Date;
    prUpdatedAt: Date;
    prMergedAt: Date;
    prClosedAt?: Date;
    status: string;
    merged: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const MergedPR: mongoose.Model<IMergedPR, {}, {}, {}, mongoose.Document<unknown, {}, IMergedPR, {}, {}> & IMergedPR & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default MergedPR;
