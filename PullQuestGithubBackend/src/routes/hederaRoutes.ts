// src/routes/hederaRoutes.ts
import { Router } from 'express';
import { hederaGithubService } from '../controllers/HederaGithubController';

const router = Router();

router.post('/ai-pr-review', async (req, res) => {
  await hederaGithubService.handleAIPRReview(req, res);
});

router.post('/mint-contributor-nft', async (req, res) => {
  await hederaGithubService.mintContributorNFT(req, res);
});

router.post('/create-bounty', async (req, res) => {
  await hederaGithubService.createBountyWithAI(req, res);
});

/**
 * GET /api/hedera/contributor-reputation/:username
 * Get contributor reputation and stats
 */
router.get('/contributor-reputation/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Fetch contributor stats and reputation
    const contributorStats = await hederaGithubService.fetchContributorStats(username);
    const reputationAssessment = await hederaGithubService.assessContributorReputation(contributorStats);
    
    res.json({
      success: true,
      username,
      stats: contributorStats,
      reputation: reputationAssessment
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hedera/federated-learning/start
 * Start a federated learning session for code quality models
 */
router.post('/federated-learning/start', async (req, res) => {
  try {
    const { modelType, participants, repoFilter } = req.body;
    
    // Start federated learning session
    // This would coordinate multiple repositories to train AI models together
    // while keeping code private using federated learning
    
    const sessionId = `fl-session-${Date.now()}`;
    
    // Record session start on Hedera for transparency
    const sessionRecord = await hederaGithubService.recordSessionOnHedera({
      sessionId,
      modelType,
      participants: participants.length,
      startTime: new Date().toISOString()
    });
    
    res.json({
      success: true,
      sessionId,
      modelType,
      participants: participants.length,
      hederaRecord: sessionRecord,
      message: "Federated learning session started"
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;