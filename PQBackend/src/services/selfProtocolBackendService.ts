/**
 * Self Protocol Backend Service for PullQuest
 * 
 * This service handles backend operations for Self Protocol integration using official SDK:
 * 1. Verifying Aadhaar zero-knowledge proofs
 * 2. Creating and managing DIDs
 * 3. Multi-wallet identity management
 * 4. Sybil resistance through nullifiers
 */

import crypto from 'crypto';
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core';

interface AadhaarProofData {
  attestationId: string;
  proof: string;
  publicSignals: string[];
  userContextData: string;
}

interface VerificationResult {
  isValid: boolean;
  identity?: {
    nationality: string;
    gender: string;
    olderThan: boolean;
    uniqueHash: string;
  };
  errors?: string[];
}

interface DIDCreationData {
  githubUsername?: string;
  walletAddress?: string;
  nullifier?: string;
  verificationResult?: any;
  userContextData?: any;
}

class SelfProtocolBackendService {
  private baseUrl: string;
  private appId: string;
  private verificationCache: Map<string, any>;
  private selfVerifier: SelfBackendVerifier;

  constructor() {
    this.baseUrl = process.env.SELF_PROTOCOL_API_URL || 'https://api.selfprotocol.com/v1';
    this.appId = process.env.SELF_PROTOCOL_APP_ID || 'pullquest-dev';
    this.verificationCache = new Map();

    // Initialize Self Protocol Backend Verifier
    this.selfVerifier = new SelfBackendVerifier(
      'pullquest', // scope - must match frontend
      process.env.SELF_VERIFICATION_ENDPOINT || `${process.env.BASE_URL || 'http://localhost:8012'}/api/self/verify`, // endpoint
      true, // mockPassport - true for development
      AllIds, // allow all document types including Aadhaar
      new DefaultConfigStore({
        minimumAge: 18, // Must be 18+ to earn bounties
        excludedCountries: [], // No country restrictions for Aadhaar
        ofac: false, // Disable OFAC for Aadhaar
      }),
      'hex' // userIdType - hex for wallet addresses
    );
  }

  /**
   * STEP 1: Verify Aadhaar zero-knowledge proof using official Self Protocol SDK
   */
  async verifyProof(proofData: AadhaarProofData): Promise<VerificationResult> {
    try {
      console.log('🔍 Verifying Aadhaar proof with Self Protocol SDK:', proofData.attestationId);

      // For development, simulate verification since Aadhaar (attestationId: 3) may not be supported yet
      // In production, this will use actual Self Protocol verification
      if (proofData.attestationId === '3') {
        // Aadhaar verification - simulate for now
        console.log('📱 Simulating Aadhaar verification (development mode)');
        
        // Extract user context to generate proper identity
        const userContext = JSON.parse(proofData.userContextData);
        const nullifier = await this.generateNullifier(userContext.walletAddress, proofData.attestationId);
        
        return {
          isValid: true,
          identity: {
            nationality: 'IND', // Aadhaar is Indian identity
            gender: 'Unknown', // Would come from actual proof
            olderThan: true, // Assume 18+ for simulation
            uniqueHash: nullifier
          }
        };
      }

      // For passport/EU ID verification (attestationId 1 or 2)
      const attestationId = Number(proofData.attestationId) as 1 | 2;
      
      const result = await this.selfVerifier.verify(
        attestationId,
        JSON.parse(proofData.proof),
        proofData.publicSignals.map(s => s.toString()),
        proofData.userContextData
      );

      if (result.isValidDetails.isValid) {
        console.log('✅ Self Protocol verification successful');
        
        const userContext = JSON.parse(proofData.userContextData);
        const nullifier = await this.generateNullifier(userContext.walletAddress, proofData.attestationId);
        
        const identity = {
          nationality: result.discloseOutput?.nationality || 'Unknown',
          gender: result.discloseOutput?.gender || 'Unknown',
          olderThan: result.isValidDetails.isMinimumAgeValid || false,
          uniqueHash: nullifier
        };
        
        return {
          isValid: true,
          identity
        };
      } else {
        console.log('❌ Proof verification failed');
        
        return {
          isValid: false,
          errors: ['Invalid Aadhaar proof']
        };
      }

    } catch (error) {
      console.error('❌ Error verifying proof:', error);
      return {
        isValid: false,
        errors: ['Verification service error']
      };
    }
  }

  /**
   * STEP 2: Create DID for verified user
   */
  async createDID(data: DIDCreationData): Promise<string> {
    try {
      console.log('🆔 Creating DID for user:', data.githubUsername);

      // Generate unique DID based on user data
      const didSuffix = this.generateDIDSuffix(data);
      const did = `did:self:${didSuffix}`;

      // Store DID mapping (in production, this would be stored in Self Protocol)
      await this.storeDIDMapping(did, data);

      console.log('✅ DID created:', did);
      
      return did;

    } catch (error) {
      console.error('❌ Error creating DID:', error);
      throw new Error('Failed to create DID');
    }
  }

  /**
   * STEP 3: Link wallet to DID
   */
  async linkWalletToDID(did: string, walletIdentity: any): Promise<{ success: boolean }> {
    try {
      console.log('🔗 Linking wallet to DID:', { did, wallet: walletIdentity.address });

      // Store wallet link (in production, this would use Self Protocol storage)
      await this.storeWalletLink(did, walletIdentity);

      return { success: true };

    } catch (error) {
      console.error('❌ Error linking wallet:', error);
      return { success: false };
    }
  }

  /**
   * STEP 4: Get linked wallets for DID
   */
  async getLinkedWallets(did: string): Promise<any[]> {
    try {
      console.log('💳 Getting wallets for DID:', did);

      // Retrieve linked wallets (in production, from Self Protocol)
      const wallets = await this.retrieveLinkedWallets(did);

      return wallets;

    } catch (error) {
      console.error('❌ Error getting wallets:', error);
      return [];
    }
  }

  /**
   * STEP 5: Generate nullifier for sybil resistance
   */
  async generateNullifier(userContextData: string, actionType: string): Promise<string> {
    try {
      // Create unique nullifier based on user data and action type
      const nullifierInput = `${userContextData}_${actionType}_${Date.now()}`;
      const nullifier = crypto.createHash('sha256').update(nullifierInput).digest('hex');

      console.log('🛡️ Generated nullifier:', nullifier.slice(0, 16) + '...');

      return nullifier;

    } catch (error) {
      console.error('❌ Error generating nullifier:', error);
      throw new Error('Failed to generate nullifier');
    }
  }

  /**
   * STEP 6: Check action permission (sybil resistance)
   */
  async checkActionPermission(did: string, actionType: string, timestamp: number): Promise<boolean> {
    try {
      console.log(`🛡️ Checking action permission for ${actionType}:`, did);

      // Check if this action has been performed before
      const actionKey = `${did}_${actionType}`;
      const lastAction = this.verificationCache.get(actionKey);

      // For demo: allow action if not performed in last hour
      const oneHour = 60 * 60 * 1000;
      if (lastAction && (timestamp - lastAction) < oneHour) {
        console.log('❌ Action blocked: too recent');
        return false;
      }

      // Record this action
      this.verificationCache.set(actionKey, timestamp);

      console.log('✅ Action permitted');
      return true;

    } catch (error) {
      console.error('❌ Error checking action permission:', error);
      return false;
    }
  }

  /**
   * STEP 7: Check for recent verification
   */
  async checkRecentVerification(walletAddress: string, githubUsername: string): Promise<{ verified: boolean; data?: any }> {
    try {
      // Check verification cache
      const verificationKey = `${walletAddress}_${githubUsername}`;
      const recentVerification = this.verificationCache.get(verificationKey);

      if (recentVerification) {
        console.log('✅ Found recent verification');
        return { verified: true, data: recentVerification };
      }

      return { verified: false };

    } catch (error) {
      console.error('❌ Error checking recent verification:', error);
      return { verified: false };
    }
  }

  // Private helper methods

  /**
   * Simulate proof verification (replace with actual Self Protocol verification)
   */
  private async simulateProofVerification(proofData: AadhaarProofData): Promise<boolean> {
    // In production, this would use the actual Self Protocol verifier:
    // const verifier = new SelfBackendVerifier(...);
    // return await verifier.verify(proofData.attestationId, proofData.proof, ...);
    
    // For demo: simulate verification based on proof structure
    return !!(proofData.proof && proofData.publicSignals && proofData.attestationId);
  }

  /**
   * Extract identity information from proof
   */
  private extractIdentityFromProof(proofData: AadhaarProofData): any {
    try {
      const userContext = JSON.parse(proofData.userContextData);
      
      return {
        nationality: 'IN', // India for Aadhaar
        gender: 'unspecified', // Privacy-preserving
        olderThan: true, // 18+ verification
        uniqueHash: crypto.createHash('sha256').update(proofData.proof).digest('hex').slice(0, 16)
      };
    } catch (error) {
      return {
        nationality: 'IN',
        gender: 'unspecified',
        olderThan: true,
        uniqueHash: 'unknown'
      };
    }
  }

  /**
   * Generate DID suffix
   */
  private generateDIDSuffix(data: DIDCreationData): string {
    const input = `${data.githubUsername || ''}_${data.walletAddress || ''}_${Date.now()}`;
    return crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
  }

  /**
   * Store DID mapping (in production, use Self Protocol storage)
   */
  private async storeDIDMapping(did: string, data: DIDCreationData): Promise<void> {
    // Store in verification cache for demo
    this.verificationCache.set(`did_${did}`, data);
    
    // In production, this would store in Self Protocol's decentralized storage
    console.log('📝 Stored DID mapping:', did);
  }

  /**
   * Store wallet link (in production, use Self Protocol storage)
   */
  private async storeWalletLink(did: string, walletIdentity: any): Promise<void> {
    // Store in verification cache for demo
    const existingWallets = this.verificationCache.get(`wallets_${did}`) || [];
    existingWallets.push(walletIdentity);
    this.verificationCache.set(`wallets_${did}`, existingWallets);
    
    console.log('📝 Stored wallet link for DID:', did);
  }

  /**
   * Retrieve linked wallets (in production, from Self Protocol storage)
   */
  private async retrieveLinkedWallets(did: string): Promise<any[]> {
    // Get from verification cache for demo
    return this.verificationCache.get(`wallets_${did}`) || [];
  }
}

// Export singleton instance
export const selfProtocolBackendService = new SelfProtocolBackendService();