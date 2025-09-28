import { Router, Request, Response } from "express";
import {
  officialSelfVerify,
  verifyAadhaarProof,
  checkIdentityStatus,
  getVerificationStatus,
  createOrGetDID,
  linkWalletToDID,
  getLinkedWallets,
  checkActionPermission
} from "../controllers/selfProtocolController";

const router = Router();

/**
 * Self Protocol API Routes for PullQuest
 * 
 * These routes handle the complete Self Protocol integration workflow:
 * 1. Aadhaar verification through Self Protocol
 * 2. DID creation and management
 * 3. Multi-wallet identity linking
 * 4. Sybil resistance through nullifiers
 */

// POST /api/self/verify - Official Self Protocol verification endpoint (called by Self relayers)
router.post("/verify", async (req: Request, res: Response) => {
  await officialSelfVerify(req, res);
});

// POST /api/self/verify-aadhaar - Legacy endpoint for manual verification
router.post("/verify-aadhaar", async (req: Request, res: Response) => {
  await verifyAadhaarProof(req, res);
});

// POST /api/self/identity/status - Check if user has verified identity
router.post("/identity/status", async (req: Request, res: Response) => {
  await checkIdentityStatus(req, res);
});

// POST /api/self/verification-status - Poll for verification completion
router.post("/verification-status", async (req: Request, res: Response) => {
  await getVerificationStatus(req, res);
});

// POST /api/self/identity - Create or get DID for user
router.post("/identity", async (req: Request, res: Response) => {
  await createOrGetDID(req, res);
});

// POST /api/self/identity/:did/wallets - Link wallet to DID
router.post("/identity/:did/wallets", async (req: Request, res: Response) => {
  await linkWalletToDID(req, res);
});

// GET /api/self/identity/:did/wallets - Get all linked wallets
router.get("/identity/:did/wallets", async (req: Request, res: Response) => {
  await getLinkedWallets(req, res);
});

// POST /api/self/identity/:did/check-action - Check action permission (sybil resistance)
router.post("/identity/:did/check-action", async (req: Request, res: Response) => {
  await checkActionPermission(req, res);
});

export default router;