import mongoose, { Document, Types } from "mongoose";
export interface IRepository {
    id: number;
    name: string;
    fullName: string;
    htmlUrl: string;
    description?: string;
    language?: string;
    stargazersCount: number;
    forksCount: number;
    size: number;
    createdAt: Date;
    updatedAt: Date;
    topics: string[];
    visibility: string;
}
export interface ILanguageStats {
    count: number;
    percentage: number;
    totalBytes: number;
}
export interface IGitHubRepository extends Document {
    userId: Types.ObjectId;
    githubUsername: string;
    repositories: IRepository[];
    organizations: string[];
    languageStats: Map<string, ILanguageStats>;
    topLanguages: string[];
    lastAnalyzed: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IGitHubRepository, {}, {}, {}, mongoose.Document<unknown, {}, IGitHubRepository, {}, {}> & IGitHubRepository & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
