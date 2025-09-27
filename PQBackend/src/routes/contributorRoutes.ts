import { Router } from "express";
import { ContributorController } from "../controllers/contributorController";
import {
  repositoryAnalysisRateLimit,
  issueFetchRateLimit,
} from "../middleware/rateLimitMiddleware";
import { StakeController } from "../controllers/stakeController";

const router = Router();

const contributorController = new ContributorController();
const stakeController = new StakeController();

// Test route to verify API is working
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Contributor API is working!" });
});

// Profile routes
router.post("/profile", (req, res) => contributorController.getContributorProfile(req, res));

// Repository analysis routes
router.post(
  "/analyze-repositories",
  repositoryAnalysisRateLimit,
  (req, res) => contributorController.analyzeUserRepositories(req, res)
);

// Issue routes
router.post(
  "/suggested-issues",
  issueFetchRateLimit,
  (req, res) => contributorController.getSuggestedIssues(req, res)
);

router.get("/issue-details/:issueId", (req, res) => contributorController.getIssueDetails(req, res));

// Stake routes
router.post("/stakes", stakeController.createStake);
router.patch("/stakes/:stakesId", stakeController.updateStakeStatus);
router.get("/stakes", stakeController.getUserStakes);
router.post("/prepare-stakes", (req, res) => contributorController.prepareStake(req, res));

export default router;