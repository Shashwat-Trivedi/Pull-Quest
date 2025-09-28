import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import selfProtocolRoutes from "./routes/selfProtocolRoutes";
import { verifyToken } from "./middleware/verifyToken";
import helmet from "helmet";
import { handlePRWebhook } from "./webhooks/githubWebhooks";
import passport from "passport";
import "./auth/github";
// import contributorRoutes from "./routes/contributorRoutes";
import contributorRoutes from "./routes/contributorRoutes";
import maintainerRoutes from "./routes/MaintainerRoutes";
import { githubApiRateLimit } from "./middleware/rateLimitMiddleware";
import User from "./model/User";
import commentRoute from './routes/commentRoutes';
import LLMRoutes from "./routes/LLMroutes"
dotenv.config();

const app: Application = express();

import fetch from "node-fetch";

if (!globalThis.fetch) {
  (globalThis as any).fetch = fetch;
}


// Middleware
app.use(helmet());
app.use(cors({
  credentials: true,
  origin: (incomingOrigin, callback) => {
    const whitelist = [
      "http://localhost:5173",
      "https://pull-quest-frontend.vercel.app"
    ];
    if (!incomingOrigin || whitelist.includes(incomingOrigin)) {
      // allow requests with no origin (like mobile apps, curl) 
      callback(null, true);
    } else {
      callback(new Error(`Origin ${incomingOrigin} not allowed by CORS`));
    }
  }
}));

app.use(express.json());

// ✅ Initialize Passport WITHOUT sessions (serverless-friendly)
app.use(passport.initialize());

// Health check
app.get("/health", (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/", authRoutes);
app.use("/api/self", selfProtocolRoutes);
// GitHub OAuth (without sessions)
app.get("/auth/github", passport.authenticate("github", { 
  scope: ["user:email", "repo", "read:user", "read:org"],
  session: false 
}));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/", session: false }),
  async (req, res) => {
    try {
      const { profile, accessToken, refreshToken } = req.user as any;
      const githubUsername = profile.username;

      await connectDB();
// ...
    const dbUser = await User.findOneAndUpdate(
      { githubUsername },
      {
        $set: {
          accessToken,
          refreshToken,
          githubInfo: JSON.stringify(profile._json),   // ← stringify here
          lastLogin: new Date(),
        },
      },
      { upsert: true, new: true }
    ) as { _id: string; role?: string; email?: string; githubUsername: string };

      const jwt = require("jsonwebtoken").sign(
        { userId: dbUser._id.toString(), githubUsername },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      const frontendUser = {
        id: dbUser._id.toString(),
        role: dbUser.role || "contributor",  // make sure `role` exists on the user doc
        email: dbUser.email,
        githubUsername,
        token: jwt, // JWT for authentication
        githubAccessToken: accessToken, // GitHub access token for API calls
      };

      const encoded = encodeURIComponent(JSON.stringify(frontendUser));
      // after you build `encoded`
      res.redirect(
        `${process.env.FRONTEND_URL || "https://pull-quest-frontend.vercel.app"}/login?user=${encoded}`
      );
      
    } catch (err) {
      console.error("❌ OAuth callback error:", err);
      res.redirect(
        `${process.env.FRONTEND_URL || "https://pull-quest-frontend.vercel.app"}?error=auth_failed`
      );
    }
  }
);

app.use("/api", githubApiRateLimit);
app.use('/api/comment', commentRoute);
app.use("/api/contributor", contributorRoutes);
app.use("/api/maintainer", maintainerRoutes);
app.use("/api/LLM", LLMRoutes);

// Webhooks
app.post("/webhooks/github", 
  express.json({ type: "application/json" }), 
  handlePRWebhook
);
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service : "PullQuest Backend API",
    version : "v1.0.0",
    message : "👋  Welcome!  The API is alive and ready.",
    docs    : "/health, /api/maintainer/…, /auth/github, …",
    note    : "See /health for a lightweight uptime probe."
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error   : "Route not found",
    message : "The requested endpoint does not exist",
  });
});
// Auth routes

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    message: "The requested endpoint does not exist",
  });
});


// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

let isConnected = false;
const connectDB = async (): Promise<void> => {
  if (isConnected) return;
  
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoURI);
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

const port = Number(process.env.PORT || 5000);
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to DB, shutting down', err);
    process.exit(1);
  });

// ✅ For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}
// ✅ Serverless export (required for Vercel)
export default app;

