import { Request, Response } from "express";
import { selfProtocolBackendService } from "../services/selfProtocolBackendService";
import User from "../model/User";

/**
 * Self Protocol Controller for PullQuest Backend
 * 
 * This controller handles:
 * 1. Aadhaar verification through Self Protocol
 * 2. DID creation and management
 * 3. Multi-wallet identity linking
 * 4. Sybil resistance through nullifiers
 */

/**
 * POST /api/self/verify
 * Official Self Protocol verification endpoint (called by Self Protocol relayers)
 * This endpoint will be called by Self Protocol after user completes verification
 */
export const officialSelfVerify = async (req: Request, res: Response) => {
  try {
    const { attestationId, proof, publicSignals, userContextData } = req.body;

    console.log('🔗 Official Self Protocol verification request:', { attestationId });

    // Verify the proof using Self Protocol backend verifier
    const verificationResult = await selfProtocolBackendService.verifyProof({
      attestationId: attestationId.toString(),
      proof: JSON.stringify(proof),
      publicSignals,
      userContextData
    });

    if (verificationResult.isValid && verificationResult.identity) {
      // Parse user context to get wallet/github info
      const userContext = JSON.parse(userContextData);
      const { walletAddress, githubUsername } = userContext;

      // Generate nullifier for sybil resistance
      const nullifier = await selfProtocolBackendService.generateNullifier(
        walletAddress, 
        attestationId.toString()
      );

      // Create or update user with verified identity
      let user = await User.findOne({ walletAddress });
      
      if (!user) {
        user = new User({
          walletAddress,
          githubUsername,
          selfProtocolDID: null,
          aadhaarVerified: true,
          nullifiers: [nullifier],
          linkedWallets: []
        });
      } else {
        user.aadhaarVerified = true;
        user.nullifiers = user.nullifiers || [];
        if (!user.nullifiers.includes(nullifier)) {
          user.nullifiers.push(nullifier);
        }
      }

      await user.save();

      // Create DID
      const did = await selfProtocolBackendService.createDID({
        githubUsername,
        walletAddress,
        nullifier,
        verificationResult: verificationResult.identity,
        userContextData: userContext
      });

      user.selfProtocolDID = did;
      await user.save();

      console.log('✅ Official Self Protocol verification completed:', { did, walletAddress });

      // Return success response expected by Self Protocol
      return res.status(200).json({
        success: true,
        verified: true,
        did,
        nullifier,
        identity: verificationResult.identity
      });
    } else {
      console.log('❌ Self Protocol verification failed');
      return res.status(200).json({
        success: false,
        verified: false,
        error: 'Verification failed'
      });
    }

  } catch (error) {
    console.error('❌ Official Self verification error:', error);
    return res.status(200).json({
      success: false,
      verified: false,
      error: 'Internal verification error'
    });
  }
};

/**
 * POST /api/self/verify-aadhaar (Legacy endpoint for backwards compatibility)
 * Verify Aadhaar proof from Self Protocol
 */
export const verifyAadhaarProof = async (req: Request, res: Response) => {
  try {
    const { attestationId, proof, publicSignals, userContextData } = req.body;

    console.log('🔍 Verifying Aadhaar proof for attestationId:', attestationId);

    // Verify the zero-knowledge proof using Self Protocol backend verifier
    const verificationResult = await selfProtocolBackendService.verifyProof({
      attestationId,
      proof,
      publicSignals,
      userContextData
    });

    if (verificationResult.isValid) {
      // Generate unique nullifier for this user (prevents double-verification)
      const nullifier = await selfProtocolBackendService.generateNullifier(
        userContextData, 
        'aadhaar_verification'
      );

      // Create DID for the user
      const did = await selfProtocolBackendService.createDID({
        nullifier,
        verificationResult: verificationResult.identity,
        userContextData: JSON.parse(userContextData)
      });

      console.log('✅ Aadhaar verification successful:', {
        did,
        nullifier,
        identity: verificationResult.identity
      });

      return res.json({
        status: 'success',
        identity: verificationResult.identity,
        nullifier,
        did,
        message: 'Aadhaar verification successful'
      });
      
    } else {
      console.log('❌ Aadhaar verification failed:', verificationResult.errors);
      
      return res.status(400).json({
        status: 'error',
        details: verificationResult.errors,
        message: 'Aadhaar verification failed'
      });
    }

  } catch (error: any) {
    console.error('❌ Error in verifyAadhaarProof:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during verification'
    });
  }
};

/**
 * POST /api/self/identity/status
 * Check if user already has verified identity
 */
export const checkIdentityStatus = async (req: Request, res: Response) => {
  try {
    const { walletAddress, githubUsername } = req.body;

    console.log('🔍 Checking identity status for:', { walletAddress, githubUsername });

    // Check if user exists in database with verified identity
    const existingUser = await User.findOne({
      $or: [
        { walletAddress },
        { githubUsername }
      ]
    });

    if (existingUser && existingUser.selfProtocolDID && existingUser.aadhaarVerified) {
      // User has verified identity
      return res.json({
        hasVerifiedIdentity: true,
        did: existingUser.selfProtocolDID,
        user: {
          id: existingUser._id,
          githubUsername: existingUser.githubUsername,
          walletAddress: existingUser.walletAddress
        }
      });
    } else {
      // User needs to verify
      return res.json({
        hasVerifiedIdentity: false,
        message: 'User needs Aadhaar verification'
      });
    }

  } catch (error: any) {
    console.error('❌ Error checking identity status:', error);
    return res.status(500).json({
      hasVerifiedIdentity: false,
      error: 'Failed to check identity status'
    });
  }
};

/**
 * POST /api/self/verification-status
 * Poll for verification completion (used by frontend)
 */
export const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { walletAddress, githubUsername } = req.body;

    console.log('🔄 Polling verification status for:', { walletAddress, githubUsername });

    // Check if verification was completed recently
    const recentVerification = await selfProtocolBackendService.checkRecentVerification(
      walletAddress, 
      githubUsername
    );

    if (recentVerification.verified) {
      return res.json({
        verified: true,
        verificationResult: recentVerification.data,
        message: 'Verification completed'
      });
    } else {
      return res.json({
        verified: false,
        message: 'Verification pending'
      });
    }

  } catch (error: any) {
    console.error('❌ Error getting verification status:', error);
    return res.status(500).json({
      verified: false,
      error: 'Failed to get verification status'
    });
  }
};

/**
 * POST /api/self/identity
 * Create or get DID for user
 */
export const createOrGetDID = async (req: Request, res: Response) => {
  try {
    const { githubUsername, walletAddress, aadhaarVerification, action } = req.body;

    console.log('🆔 Creating/getting DID for:', { githubUsername, walletAddress });

    if (action === 'create_or_get_did') {
      // Check if DID already exists
      const existingUser = await User.findOne({
        $or: [{ githubUsername }, { walletAddress }]
      });

      let did: string;

      if (existingUser && existingUser.selfProtocolDID) {
        // Return existing DID
        did = existingUser.selfProtocolDID;
        console.log('🔍 Found existing DID:', did);
      } else {
        // Create new DID
        did = await selfProtocolBackendService.createDID({
          githubUsername,
          walletAddress,
          verificationResult: aadhaarVerification
        });
        
        console.log('🆔 Created new DID:', did);

        // Update or create user record
        await User.findOneAndUpdate(
          { $or: [{ githubUsername }, { walletAddress }] },
          {
            githubUsername,
            walletAddress,
            selfProtocolDID: did,
            aadhaarVerified: true,
            isActive: true,
            lastLogin: new Date()
          },
          { upsert: true, new: true }
        );
      }

      return res.json({
        did,
        message: 'DID created/retrieved successfully'
      });
    }

    return res.status(400).json({
      error: 'Invalid action'
    });

  } catch (error: any) {
    console.error('❌ Error creating/getting DID:', error);
    return res.status(500).json({
      error: 'Failed to create/get DID'
    });
  }
};

/**
 * POST /api/self/identity/:did/wallets
 * Link wallet to existing DID
 */
export const linkWalletToDID = async (req: Request, res: Response) => {
  try {
    const { did } = req.params;
    const { walletIdentity, action } = req.body;

    console.log('🔗 Linking wallet to DID:', { did, wallet: walletIdentity.address });

    if (action === 'link_wallet') {
      // Store wallet link in Self Protocol
      const linkResult = await selfProtocolBackendService.linkWalletToDID(did, walletIdentity);

      if (linkResult.success) {
        // Update user record with new wallet
        await User.findOneAndUpdate(
          { selfProtocolDID: did },
          {
            $addToSet: {
              linkedWallets: walletIdentity
            },
            lastLogin: new Date()
          }
        );

        return res.json({
          success: true,
          walletId: walletIdentity.id,
          message: 'Wallet linked successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Failed to link wallet'
        });
      }
    }

    return res.status(400).json({
      error: 'Invalid action'
    });

  } catch (error: any) {
    console.error('❌ Error linking wallet to DID:', error);
    return res.status(500).json({
      error: 'Failed to link wallet'
    });
  }
};

/**
 * GET /api/self/identity/:did/wallets
 * Get all wallets linked to a DID
 */
export const getLinkedWallets = async (req: Request, res: Response) => {
  try {
    const { did } = req.params;

    console.log('💳 Getting linked wallets for DID:', did);

    // Get wallets from Self Protocol
    const wallets = await selfProtocolBackendService.getLinkedWallets(did);

    return res.json(wallets);

  } catch (error: any) {
    console.error('❌ Error getting linked wallets:', error);
    return res.status(500).json({
      error: 'Failed to get linked wallets',
      wallets: []
    });
  }
};

/**
 * POST /api/self/identity/:did/check-action
 * Check if action is allowed (sybil resistance)
 */
export const checkActionPermission = async (req: Request, res: Response) => {
  try {
    const { did } = req.params;
    const { actionType, timestamp } = req.body;

    console.log(`🛡️ Checking action permission for ${actionType}:`, did);

    // Check nullifier to prevent double actions
    const isAllowed = await selfProtocolBackendService.checkActionPermission(
      did, 
      actionType, 
      timestamp
    );

    return res.json({
      allowed: isAllowed,
      actionType,
      timestamp
    });

  } catch (error: any) {
    console.error('❌ Error checking action permission:', error);
    return res.status(500).json({
      allowed: false,
      error: 'Failed to check action permission'
    });
  }
};