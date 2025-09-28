// src/routes/commentRoutes.ts
import { Router } from "express";
import { commentOnIssue, commentOnPrs, formComment, AddbonusXp , stakeComment, xpAwardComment, bountyAwardComment} from "../controllers/commentController";

const router: Router = Router();
router.post("/issues", commentOnIssue);
router.post("/PullRequest", commentOnPrs);
router.post("/form", formComment);
router.post("/XpAddition", AddbonusXp);
router.post("/stake", stakeComment);
router.post("/XPHedera", xpAwardComment);
router.post("/BountyHedera", bountyAwardComment);
export default router;