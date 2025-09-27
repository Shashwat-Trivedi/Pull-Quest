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
export interface IMaintainerIssue extends Document {
    id: number;
    number: number;
    title: string;
    body: string;
    state: string;
    htmlUrl: string;
    user: IUser;
    assignee?: IUser;
    assignees: IUser[];
    labels: ILabel[];
    milestone?: IMilestone;
    repository: IRepository;
    commentsCount: number;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
    authorAssociation: string;
    difficulty?: string;
    estimatedHours?: number;
    bounty?: number;
    xpReward?: number;
    stakingRequired: number;
    expirationDate?: Date;
}
declare const MaintainerIssue: mongoose.Model<IMaintainerIssue, {}, {}, {}, mongoose.Document<unknown, {}, IMaintainerIssue, {}, {}> & IMaintainerIssue & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default MaintainerIssue;
