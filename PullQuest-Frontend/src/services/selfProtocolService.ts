import { getUniversalLink } from '@selfxyz/core';
import { SelfAppBuilder, SelfApp } from '@selfxyz/qrcode';
import { 
  WalletIdentity, 
  AadhaarProof, 
  VerificationResult 
} from '../types/selfProtocol';

/**
 * Self Protocol Service for PullQuest
 * Handles Aadhaar verification and multi-wallet identity management
 */
export class SelfProtocolService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8012';
  }

  /**
   * STEP 1: Generate Self Protocol verification URL/QR using official SDK
   * This creates a deep link that opens Self app for Aadhaar verification
   * Falls back to mock implementation if network is unavailable
   */
  async generateVerificationRequest(walletAddress: string, githubUsername: string): Promise<SelfApp> {
    try {
      // Create unique user context
      const userContext = {
        walletAddress,
        githubUsername,
        timestamp: Date.now(),
        platform: 'pullquest'
      };

      // Try to create Self App - if network fails, use mock implementation
      try {
        // For development, let's use a very simple configuration that works with Self Protocol
        const selfApp = new SelfAppBuilder({
          appName: "PullQuest",
          logoBase64: "/Logo.png",
          endpointType: "staging_https",
          endpoint: "https://your-domain.com/api/verify", // This needs to be a real public URL
          scope: "pullquest", // Simplified scope
          userId: walletAddress.toLowerCase(), // Ensure lowercase
          userIdType: "hex",
          userDefinedData: JSON.stringify(userContext),
          disclosures: {
            // Minimal disclosures for testing
            minimumAge: 18,
            ofac: false,
            excludedCountries: [],
            // Try with passport verification first since Aadhaar might have circuit issues
            nationality: false,
            gender: false,
            name: false,
            date_of_birth: false
          }
        }).build();
        
        console.log('🔗 Generated Self Protocol app configuration');
        return selfApp;
        
      } catch (networkError: any) {
        console.warn('⚠️ Self Protocol configuration error, using mock implementation:', networkError?.message || 'Unknown network error');
        console.log('💡 This is normal in development. The mock verification will work for testing.');
        
        // Return a mock SelfApp object for development
        return this.createMockSelfApp(userContext);
      }
      
    } catch (error) {
      console.error('❌ Error generating verification request:', error);
      throw new Error('Failed to generate verification request');
    }
  }

  /**
   * STEP 2: Verify Aadhaar proof received from Self Protocol
   * This is called by your backend after Self sends the proof
   */
  async verifyAadhaarProof(proofData: AadhaarProof): Promise<VerificationResult> {
    try {
      console.log('🔍 Verifying Aadhaar proof...');
      
      // Check if verification is complete
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8012'}/api/self/verification-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attestationId: proofData.attestationId,
          proof: proofData.proof,
          publicSignals: proofData.publicSignals,
          userContextData: proofData.userContextData
        })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        console.log('✅ Aadhaar verification successful:', result.identity);
        return {
          isValid: true,
          identity: result.identity,
          nullifier: result.nullifier,
          did: result.did
        };
      } else {
        console.log('❌ Aadhaar verification failed:', result.details);
        throw new Error('Aadhaar verification failed');
      }

    } catch (error) {
      console.error('❌ Error verifying Aadhaar proof:', error);
      throw error;
    }
  }

  /**
   * STEP 3: Create or retrieve DID for verified user
   * Links Aadhaar verification to a persistent identity
   */
  async createOrGetDID(githubUsername: string, walletAddress: string, aadhaarVerification: VerificationResult): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/self/identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername,
          walletAddress,
          aadhaarVerification,
          action: 'create_or_get_did'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create/get DID');
      }

      const data = await response.json();
      
      console.log('🆔 DID created/retrieved:', data.did);
      
      return data.did;
      
    } catch (error) {
      console.error('❌ Error creating/getting DID:', error);
      throw error;
    }
  }

  /**
   * STEP 4: Link additional wallets to existing DID
   * Allows users to connect multiple wallets while maintaining one identity
   */
  async linkWalletToDID(did: string, walletData: Omit<WalletIdentity, 'id' | 'linkedAt'>): Promise<WalletIdentity> {
    try {
      console.log('🔗 Linking wallet to DID:', { did, wallet: walletData.address });

      const walletIdentity: WalletIdentity = {
        id: this.generateWalletId(),
        ...walletData,
        linkedAt: new Date(),
        isVerified: false, // Will be verified through signature
        isPrimary: false   // User can set primary later
      };

      const response = await fetch(`${this.baseUrl}/api/self/identity/${did}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletIdentity,
          action: 'link_wallet'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to link wallet');
      }

      const result = await response.json();
      
      // Initiate wallet verification through signature
      await this.initiateWalletVerification(did, walletIdentity.id);
      
      console.log('✅ Wallet linked successfully:', result);
      
      return walletIdentity;

    } catch (error) {
      console.error('❌ Error linking wallet:', error);
      throw error;
    }
  }

  /**
   * STEP 5: Get all wallets linked to a DID
   */
  async getLinkedWallets(did: string): Promise<WalletIdentity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/self/identity/${did}/wallets`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }

      const wallets = await response.json();
      
      console.log('💳 Retrieved linked wallets:', wallets.length);
      
      return wallets;

    } catch (error) {
      console.error('❌ Error fetching wallets:', error);
      return [];
    }
  }

  /**
   * STEP 6: Check if action is allowed (sybil resistance)
   * Uses nullifiers to prevent double-claiming/voting
   */
  async checkActionPermission(did: string, actionType: 'claim_bounty' | 'vote' | 'review'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/self/identity/${did}/check-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      
      console.log(`🛡️ Action permission for ${actionType}:`, result.allowed);
      
      return result.allowed;

    } catch (error) {
      console.error('❌ Error checking action permission:', error);
      return false;
    }
  }

  /**
   * Helper: Generate wallet verification signature request
   */
  private async initiateWalletVerification(did: string, walletId: string): Promise<void> {
    const challenge = `PullQuest wallet verification: ${Date.now()}_${Math.random()}`;
    
    await fetch(`${this.baseUrl}/api/self/identity/${did}/wallets/${walletId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challenge,
        timestamp: Date.now()
      })
    });
  }

  /**
   * Generate deep link URL using official SDK
   */
  generateDeepLink(selfApp: SelfApp): string {
    try {
      const deepLink = getUniversalLink(selfApp);
      console.log('🔗 Generated deep link:', deepLink);
      return deepLink;
    } catch (error) {
      console.error('❌ Error generating deep link:', error);
      throw new Error('Failed to generate deep link');
    }
  }

  /**
   * Helper: Create mock SelfApp for development when network is unavailable
   */
  private createMockSelfApp(userContext: any): SelfApp {
    // Create a mock SelfApp object that mimics the real one
    const mockApp = {
      appName: "PullQuest",
      logoBase64: "/Logo.png",
      endpointType: "staging_https" as const,
      endpoint: `${this.baseUrl}/api/self/verify`, // Use local backend for mock
      scope: "pullquest", // Simplified scope
      userId: userContext.walletAddress,
      userIdType: "hex" as const,
      userDefinedData: JSON.stringify(userContext),
      disclosures: {
        minimumAge: 18,
        nationality: true,
        gender: true,
        name: true,
        date_of_birth: true,
        ofac: false,
        excludedCountries: []
      },
      // Required SelfApp properties
      deeplinkCallback: '',
      header: '',
      sessionId: `mock_${Date.now()}`,
      devMode: true,
      version: 2,
      isMock: true
    } as unknown as SelfApp;
    
    console.log('🧪 Created mock Self Protocol app for development');
    return mockApp;
  }

  /**
   * Helper: Generate unique wallet ID
   */
  private generateWalletId(): string {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const selfProtocolService = new SelfProtocolService();