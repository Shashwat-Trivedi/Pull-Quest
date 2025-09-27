import mongoose, { Document } from "mongoose";
export interface IUser extends Document, IUserMethods {
    email: string;
    password: string;
    role: "contributor" | "maintainer" | "company";
    accessToken?: string;
    githubInfo?: string;
    profile: {
        name: string;
        bio?: string;
    };
    coins: number;
    xp?: number;
    rank?: string;
    monthlyCoinsLastRefill?: Date;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    upadtedAt: Date;
    githubUsername?: string;
}
interface IUserMethods {
    calculateRank(): string;
    xpForNextRank(): number;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
