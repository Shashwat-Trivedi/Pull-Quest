import { Router } from "express";
import { handleCodeReview, fullReview } from "../controllers/GptController";

const router = Router();

router.post("/code", handleCodeReview);
router.post("/full-review", fullReview)
export default router;