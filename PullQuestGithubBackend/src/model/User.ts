import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document, IUserMethods {
  email: string;
  password: string;
  role: "contributor" | "maintainer" | "company";
  accessToken?: string;          // latest GitHub OAuth token
  githubInfo?: string;           // JSON-stringified GitHub profile
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
  
  // Wallet-related fields
  walletAddress?: string;
  publicAddress?: string;        // Support existing database field
  walletType?: string;
  isWalletVerified?: boolean;
}

interface IUserMethods {
  calculateRank(): string;
  xpForNextRank(): number;
}

const userSchema = new Schema<IUser & IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["contributor", "maintainer", "company"],
      default: "contributor",
    },
    githubUsername: { type: String, sparse: true, trim: true },
    
    accessToken: { type: String },
    githubInfo: { type: String },
    
    profile: {
      name: { type: String, trim: true },
      bio: { type: String, maxlength: 500 },
    },
    coins: {
      type: Number,
      default: function () {
        return this?.role === "contributor" || this?.role == null
          ? 100
          : 0;
      },
    },
  
    xp: { type: Number, default: 0 },
    rank: {
      type: String,
      default: "Code Novice",
      enum: [
        "Code Novice",
        "Code Apprentice",
        "Code Contributor",
        "Code Master",
        "Code Expert",
        "Open Source Legend",
      ],
    },
    monthlyCoinsLastRefill: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
    
    // Wallet-related schema fields
    walletAddress: {
      type: String,
      trim: true,
      sparse: true,
      validate: {
        validator: function(v: string) {
          // Allow Ethereum addresses or custom formats
          return !v || /^0x[a-fA-F0-9]{40}$/.test(v) || v.length > 10;
        },
        message: 'Invalid wallet address format.'
      }
    },
    publicAddress: {
      type: String,
      trim: true,
      sparse: true,
      validate: {
        validator: function(v: string) {
          // Allow any string format for publicAddress
          return !v || v.length > 5;
        },
        message: 'Invalid public address format.'
      }
    },
    walletType: {
      type: String,
      enum: ['MetaMask', 'WalletConnect', 'Coinbase', 'Trust Wallet', 'Other'],
      default: 'MetaMask'
    },
    isWalletVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ xp: -1 });
userSchema.index({ walletAddress: 1 }, { sparse: true });
userSchema.index({ publicAddress: 1 }, { sparse: true });
userSchema.index({ githubUsername: 1 }, { sparse: true });

userSchema.methods.calculateRank = function (): string {
  const xp = this.xp || 0;
  if (xp >= 5000) return "Open Source Legend";
  if (xp >= 3000 && xp < 5000) return "Code Expert";
  if (xp >= 1500 && xp < 3000) return "Code Master";
  if (xp >= 500 && xp < 1500) return "Code Contributor";
  if (xp >= 100 && xp < 500) return "Code Apprentice";
  return "Code Novice";
};

userSchema.pre("save", function (next) {
  if (this.role === "contributor") {
    this.rank = this.calculateRank();
  }
  
  // Auto-sync wallet addresses
  if (this.publicAddress && !this.walletAddress) {
    this.walletAddress = this.publicAddress;
  } else if (this.walletAddress && !this.publicAddress) {
    this.publicAddress = this.walletAddress;
  }
  
  next();
});

userSchema.methods.xpForNextRank = function (): number {
  const xp = this.xp || 0;
  if (xp < 100) return 100 - xp;
  if (xp >= 100 && xp < 500) return 500 - xp;
  if (xp >= 500 && xp < 1500) return 1500 - xp;
  if (xp >= 1500 && xp < 3000) return 3500 - xp;
  if (xp >= 3000 && xp < 5000) return 5000 - xp;
  return 0;
};

export default mongoose.model<IUser>("User", userSchema);