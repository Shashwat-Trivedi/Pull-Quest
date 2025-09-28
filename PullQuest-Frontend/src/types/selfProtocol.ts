// Self Protocol Integration Types for PullQuest

export interface SelfIdentity {
  did: string; // Decentralized Identifier
  wallets: WalletIdentity[];
  aadhaarVerified: boolean;
  githubAccount?: GitHubIdentity;
  verifiedCredentials: VerifiedCredential[];
  reputation: ReputationScore;
  nullifiers: string[]; // Prevent double-claiming
}

export interface WalletIdentity {
  id: string;
  address: string;
  walletType: 'hedera' | 'metamask' | 'ethereum' | 'solana';
  network: string;
  isVerified: boolean;
  linkedAt: Date;
  balance?: string;
  isPrimary: boolean;
}

export interface GitHubIdentity {
  username: string;
  userId: string;
  profileUrl: string;
  isVerified: boolean;
  contributions: number;
  repositories: string[];
}

export interface VerifiedCredential {
  type: 'aadhaar' | 'wallet' | 'github' | 'reputation';
  issuer: string;
  credential: any;
  issuedAt: Date;
  expiresAt?: Date;
}

export interface ReputationScore {
  overall: number;
  categories: {
    codeQuality: number;
    communication: number;
    reliability: number;
    innovation: number;
  };
  badges: string[];
  trustScore: number;
}

export interface AadhaarProof {
  attestationId: string;
  proof: string;
  publicSignals: string[];
  userContextData: any;
  disclosures: {
    minimumAge: number;
    nationality: boolean;
    gender: boolean;
    uniqueness: boolean; // Sybil resistance
  };
}

export interface SelfAppConfig {
  version: number;
  appName: string;
  scope: string;
  endpoint: string;
  userId: string;
  userIdType: 'hex' | 'uuid';
  endpointType: 'staging_https' | 'production_https' | 'celo';
  logoBase64: string;
  userDefinedData: string;
  disclosures: {
    minimumAge: number;
    nationality: boolean;
    gender: boolean;
  };
}

export interface VerificationResult {
  isValid: boolean;
  identity: {
    nationality: string;
    gender: string;
    olderThan: boolean;
    uniqueHash: string; // For sybil resistance
  };
  nullifier: string;
  did: string;
}