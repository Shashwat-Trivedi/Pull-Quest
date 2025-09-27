import mongoose, { Document, Types } from "mongoose";
export interface IOrgMember {
    id: number;
    login: string;
    avatarUrl: string;
    htmlUrl: string;
    type: string;
    role: "member" | "admin" | "owner";
    publicMember: boolean;
}
export interface IOrgRepository {
    id: number;
    name: string;
    fullName: string;
    htmlUrl: string;
    description?: string;
    language?: string;
    stargazersCount: number;
    forksCount: number;
    watchersCount: number;
    size: number;
    defaultBranch: string;
    openIssuesCount: number;
    topics: string[];
    visibility: "public" | "private" | "internal";
    archived: boolean;
    disabled: boolean;
    fork: boolean;
    createdAt: Date;
    updatedAt: Date;
    pushedAt?: Date;
    license?: {
        key: string;
        name: string;
        spdxId: string;
    };
}
export interface IOrgTeam {
    id: number;
    name: string;
    slug: string;
    description?: string;
    privacy: "closed" | "secret";
    permission: "pull" | "push" | "admin" | "maintain" | "triage";
    membersCount: number;
    reposCount: number;
    htmlUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IOrgPlan {
    name: string;
    space: number;
    privateRepos: number;
    collaborators: number;
}
export interface IOrganization {
    id: number;
    login: string;
    name?: string;
    description?: string;
    company?: string;
    blog?: string;
    location?: string;
    email?: string;
    twitterUsername?: string;
    avatarUrl: string;
    gravatarId?: string;
    htmlUrl: string;
    followersUrl: string;
    followingUrl: string;
    reposUrl: string;
    eventsUrl: string;
    hooksUrl: string;
    issuesUrl: string;
    membersUrl: string;
    publicMembersUrl: string;
    type: string;
    publicRepos: number;
    publicGists: number;
    followers: number;
    following: number;
    createdAt: Date;
    updatedAt: Date;
    totalPrivateRepos?: number;
    ownedPrivateRepos?: number;
    privateGists?: number;
    diskUsage?: number;
    collaborators?: number;
    billingEmail?: string;
    plan?: IOrgPlan;
    defaultRepositoryPermission?: "read" | "write" | "admin" | "none";
    membersCanCreateRepos?: boolean;
    twoFactorRequirementEnabled?: boolean;
    membersAllowedRepositoryCreationType?: "all" | "private" | "none";
    membersCanCreatePages?: boolean;
    membersCanCreatePrivatePages?: boolean;
    membersCanCreatePublicPages?: boolean;
    dependencyGraphEnabledForNewRepos?: boolean;
    dependabotAlertsEnabledForNewRepos?: boolean;
    dependabotSecurityUpdatesEnabledForNewRepos?: boolean;
    advancedSecurityEnabledForNewRepos?: boolean;
    secretScanningEnabledForNewRepos?: boolean;
    secretScanningPushProtectionEnabledForNewRepos?: boolean;
}
export interface IApiKey {
    secretKey: string;
    context: string;
    githubUsername: string;
    position?: string;
    repoLinks: string[];
    orgName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IGitHubOrganization extends Document {
    userId: Types.ObjectId;
    githubUsername: string;
    organization: IOrganization;
    members: IOrgMember[];
    repositories: IOrgRepository[];
    teams: IOrgTeam[];
    membership?: {
        state: "active" | "pending";
        role: "member" | "admin" | "owner";
        organizationUrl: string;
        publicMember: boolean;
    };
    statistics: {
        totalRepos: number;
        totalMembers: number;
        totalTeams: number;
        languageDistribution: {
            [key: string]: number;
        };
        topContributors: string[];
        recentActivity: {
            commits: number;
            issues: number;
            pullRequests: number;
            releases: number;
        };
    };
    apiKeys: IApiKey[];
    lastFetched: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IGitHubOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IGitHubOrganization, {}, {}> & IGitHubOrganization & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
