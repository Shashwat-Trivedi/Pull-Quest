import mongoose, { Document, Types } from "mongoose";
export interface IApiKey extends Document {
    userId: Types.ObjectId;
    secretKey: string;
    context: string;
    githubUsername: string;
    position?: string;
    repoLinks: string[];
    orgName?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IApiKey, {}, {}, {}, mongoose.Document<unknown, {}, IApiKey, {}, {}> & IApiKey & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
