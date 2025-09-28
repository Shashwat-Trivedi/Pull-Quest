import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

// POST /register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, githubUsername } = req.body;

  if (!role || !password) {
    res.status(400).json({ message: "Role and password are required" });
    return;
  }

  if (role === "company") {
    if (!email) {
      res.status(400).json({ message: "Email is required for company" });
      return;
    }
  } else {
    if (!githubUsername) {
      res.status(400).json({ message: "GitHub username is required for this role" });
      return;
    }
  }

  try {
    const existing = await User.findOne(
      role === "company"
        ? { email }
        : { githubUsername, role }
    );

    if (existing) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email || undefined,
      password: hashedPassword,
      role,
      githubUsername: githubUsername || undefined,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, githubUsername } = req.body;

  if (!role) {
    res.status(400).json({ message: "Role is required" });
    return;
  }

  try {
    let user;

    if (role === "company") {
      if (!email || !password) {
        res.status(400).json({ message: "Email and password required for company" });
        return;
      }

      user = await User.findOne({ email, role });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
    } else {
      if (!githubUsername) {
        res.status(400).json({ message: "GitHub username is required for this role" });
        return;
      }

      user = await User.findOne({ githubUsername, role });
      if (!user) {
        res.status(401).json({ message: "Invalid GitHub credentials" });
        return;
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/user - Get current user info (for UserProvider)
router.get("/api/user", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // The verifyToken middleware adds user info to req.user
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select('-password'); // Exclude password
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      githubUsername: user.githubUsername,
      profile: user.profile,
      coins: user.coins,
      xp: user.xp,
      rank: user.rank,
      isActive: user.isActive,
      selfProtocolDID: user.selfProtocolDID,
      aadhaarVerified: user.aadhaarVerified,
      walletAddress: user.walletAddress,
      trustScore: user.trustScore
    });

  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

export default router;
