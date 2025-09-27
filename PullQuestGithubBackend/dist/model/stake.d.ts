import mongoose, { Document, Types } from "mongoose";
export declare enum StakeStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export interface IStake extends Document {
    userId: Types.ObjectId;
    issueId: number;
    repository: string;
    amount: number;
    status: StakeStatus;
    prUrl: string;
    xpEarned?: number;
    coinsEarned?: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const Stake: mongoose.Model<IStake, {}, {}, {}, mongoose.Document<unknown, {}, IStake, {}, {}> & IStake & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Stake;
