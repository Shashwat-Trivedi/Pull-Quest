import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet, ArrowRight, Github, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { AadhaarVerification } from '../components/verification/AadhaarVerification';
import { selfProtocolService } from '../services/selfProtocolService';
import { VerificationResult } from '../types/selfProtocol';

// Enhanced wallet state to include Self Protocol data
interface EnhancedWalletState {
  // Traditional wallet connection
  isConnected: boolean;
  isConnecting: boolean;
  accountId: string | null;
  balance: string | null;
  walletType: "hedera" | "metamask" | null;
  error: string | null;
  
  // Self Protocol integration
  needsAadhaarVerification: boolean;
  aadhaarVerified: boolean;
  userDID: string | null;
  isCreatingIdentity: boolean;
}

/**
 * Enhanced ConnectWallet Component with Self Protocol Integration
 * 
 * Flow:
 * 1. User connects wallet (existing flow)
 * 2. Check if user has verified Aadhaar identity
 * 3. If not, show Aadhaar verification component
 * 4. Create/link DID after verification
 * 5. Allow access to platform features
 */
export default function EnhancedConnectWallet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [walletState, setWalletState] = useState<EnhancedWalletState>({
    isConnected: false,
    isConnecting: false,
    accountId: null,
    balance: null,
    walletType: null,
    error: null,
    needsAadhaarVerification: false,
    aadhaarVerified: false,
    userDID: null,
    isCreatingIdentity: false
  });

  // GitHub context from URL params
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const issue = searchParams.get('issue');
  const githubUsername = searchParams.get('github') || 'user';
  const isFromGitHub = owner && repo;

  /**
   * STEP 1: Handle wallet connection (your existing flow)
   */
  const handleConnect = async (type: "hedera" | "metamask") => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      let result;
      
      console.log(`🔗 Connecting ${type} wallet...`);
      
      if (type === "hedera") {
        result = await connectHederaWallet();
      } else {
        result = await connectMetaMask();
      }
      
      console.log('✅ Wallet connected:', result);
      
      // Update wallet connection state
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        accountId: result.accountId,
        balance: result.balance,
        walletType: type,
        error: null
      }));

      // STEP 2: Check if user needs Aadhaar verification
      await checkIdentityStatus(result.accountId, githubUsername);

      toast.success(`${type === 'hedera' ? 'Hedera Wallet' : 'MetaMask'} connected successfully!`);
      
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      setWalletState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message 
      }));
      toast.error(error.message);
    }
  };

  /**
   * STEP 2: Check if user already has verified identity
   */
  const checkIdentityStatus = async (walletAddress: string, githubUser: string) => {
    try {
      console.log('🔍 Checking identity status for:', { walletAddress, githubUser });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8012'}/api/self/identity/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          githubUsername: githubUser
        })
      });

      if (response.ok) {
        const identityStatus = await response.json();
        
        if (identityStatus.hasVerifiedIdentity) {
          // User already has verified identity
          console.log('✅ User has verified identity:', identityStatus.did);
          setWalletState(prev => ({
            ...prev,
            aadhaarVerified: true,
            userDID: identityStatus.did,
            needsAadhaarVerification: false
          }));
        } else {
          // User needs to verify with Aadhaar
          console.log('⚠️ User needs Aadhaar verification');
          setWalletState(prev => ({
            ...prev,
            needsAadhaarVerification: true,
            aadhaarVerified: false
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error checking identity status:', error);
      // Default to requiring verification
      setWalletState(prev => ({
        ...prev,
        needsAadhaarVerification: true
      }));
    }
  };

  /**
   * STEP 3: Handle Aadhaar verification completion
   */
  const handleAadhaarVerificationComplete = async (verificationResult: VerificationResult) => {
    try {
      setWalletState(prev => ({ ...prev, isCreatingIdentity: true }));
      
      console.log('🎉 Aadhaar verification completed:', verificationResult);

      // Create DID and link wallet
      const did = await selfProtocolService.createOrGetDID(githubUsername, walletState.accountId!, verificationResult);
      
      // Link the current wallet to the DID
      if (walletState.accountId && walletState.walletType) {
        await selfProtocolService.linkWalletToDID(did, {
          address: walletState.accountId,
          walletType: walletState.walletType,
          network: walletState.walletType === 'hedera' ? 'testnet' : 'ethereum',
          isVerified: true,
          isPrimary: true
        });
      }

      // Update state
      setWalletState(prev => ({
        ...prev,
        aadhaarVerified: true,
        userDID: did,
        needsAadhaarVerification: false,
        isCreatingIdentity: false
      }));

      // Create user account in your system
      await createUserAccount(walletState.accountId!, walletState.walletType!, did);
      
      toast.success('🎉 Identity verified and account created!');

    } catch (error: any) {
      console.error('❌ Error completing verification:', error);
      setWalletState(prev => ({ 
        ...prev, 
        isCreatingIdentity: false,
        error: error.message 
      }));
      toast.error('Failed to complete identity setup');
    }
  };

  /**
   * Handle verification errors
   */
  const handleAadhaarVerificationError = (error: string) => {
    console.error('❌ Aadhaar verification error:', error);
    setWalletState(prev => ({ 
      ...prev, 
      error,
      needsAadhaarVerification: true 
    }));
    toast.error(error);
  };

  /**
   * Create user account in your backend (enhanced with DID)
   */
  const createUserAccount = async (walletAddress: string, walletType: string, did: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8012'}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          githubUsername,
          walletType,
          selfProtocolDID: did, // NEW: Include DID
          aadhaarVerified: true, // NEW: Mark as verified
          role: 'contributor'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User account created with DID:', data);
        toast.success(`Account created! Welcome ${data.user.githubUsername}`);
      }
    } catch (error) {
      console.warn('Account creation failed, but identity is verified');
    }
  };

  /**
   * Continue to dashboard/issue page
   */
  const handleContinue = () => {
    if (isFromGitHub && issue) {
      navigate(`/contributor/issue/${issue}`);
    } else {
      navigate('/contributor/dashboard');
    }
  };

  /**
   * Your existing wallet connection functions
   */
  const connectHederaWallet = async () => {
    // Your existing Hedera connection logic
    if (!window.hashpack) {
      throw new Error('HashPack wallet not found. Please install HashPack.');
    }

    const connectionResult = await window.hashpack.connectToLocalWallet({
      name: 'PullQuest',
      description: 'Connect to earn rewards',
      icon: window.location.origin + '/Logo.png'
    });

    if (!connectionResult.success) {
      throw new Error('Failed to connect to HashPack wallet');
    }

    const accountId = connectionResult.accountIds?.[0];
    if (!accountId) {
      throw new Error('No accounts found in HashPack wallet');
    }

    // Fetch balance
    let balance = 'N/A';
    try {
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
      if (response.ok) {
        const data = await response.json();
        const balanceInTinybars = data.balance?.balance || 0;
        balance = (balanceInTinybars / 100_000_000).toFixed(4);
      }
    } catch (balanceError) {
      console.warn('Could not fetch balance:', balanceError);
    }

    return { accountId, balance };
  };

  const connectMetaMask = async () => {
    // Your existing MetaMask connection logic
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const account = accounts[0];
    
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [account, 'latest']
    });
    
    const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
    
    return { 
      accountId: account, 
      balance: balanceInEth 
    };
  };

  /**
   * Render the appropriate UI based on current state
   */
  const renderContent = () => {
    // Show Aadhaar verification if needed
    if (walletState.isConnected && walletState.needsAadhaarVerification && !walletState.aadhaarVerified) {
      return (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Identity Verification Required:</strong> To prevent fraud and ensure fair access, 
              please verify your identity with Aadhaar through Self Protocol.
            </AlertDescription>
          </Alert>

          <AadhaarVerification
            walletAddress={walletState.accountId!}
            githubUsername={githubUsername}
            onVerificationComplete={handleAadhaarVerificationComplete}
            onError={handleAadhaarVerificationError}
          />
        </div>
      );
    }

    // Show wallet connection options
    if (!walletState.isConnected) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Wallet</CardTitle>
            <CardDescription>
              Select your preferred wallet to connect and verify identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletState.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {walletState.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => handleConnect("hedera")}
                disabled={walletState.isConnecting}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {walletState.isConnecting ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Hedera Wallet
                  </div>
                )}
              </Button>

              <Button
                onClick={() => handleConnect("metamask")}
                disabled={walletState.isConnecting}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600"
                size="lg"
              >
                {walletState.isConnecting ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect MetaMask
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Show success state
    if (walletState.isConnected && walletState.aadhaarVerified) {
      return (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Wallet Connected & Identity Verified! 🎉</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Wallet className="w-3 h-3 mr-1" />
                        {walletState.walletType === 'hedera' ? 'Hedera' : 'MetaMask'}
                      </Badge>
                      <Badge variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        Aadhaar Verified
                      </Badge>
                      <Badge variant="outline">
                        <Github className="w-3 h-3 mr-1" />
                        {githubUsername}
                      </Badge>
                    </div>
                    <div className="font-mono text-xs">
                      Address: {walletState.accountId?.slice(0, 8)}...{walletState.accountId?.slice(-6)}
                    </div>
                    {walletState.balance && (
                      <div className="text-xs">
                        Balance: {walletState.balance} {walletState.walletType === 'hedera' ? 'HBAR' : 'ETH'}
                      </div>
                    )}
                    {walletState.userDID && (
                      <div className="text-xs text-green-600">
                        DID: {walletState.userDID.slice(0, 20)}...
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleContinue}
              className="w-full h-12"
              size="lg"
            >
              <div className="flex items-center">
                {isFromGitHub && issue ? 'Continue to Issue' : 'Go to Dashboard'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Show creating identity state
    if (walletState.isCreatingIdentity) {
      return (
        <Card>
          <CardContent className="space-y-4 pt-6 text-center">
            <div className="animate-pulse">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Creating Your Identity...</h3>
              <p className="text-gray-600">Linking wallet to your verified identity</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Connect & Verify</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect your wallet and verify your identity with Aadhaar to start earning rewards
          </p>
        </div>

        {/* GitHub Context */}
        {isFromGitHub && (
          <Alert className="mb-6 bg-blue-50 border-blue-200 max-w-lg mx-auto">
            <Github className="h-4 w-4" />
            <AlertDescription>
              From <strong>{owner}/{repo}</strong>
              {issue && <Badge variant="outline" className="ml-2">#{issue}</Badge>}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          {renderContent()}

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TypeScript declarations
declare global {
  interface Window {
    ethereum?: any;
    hashpack?: {
      connectToLocalWallet: (metadata: any) => Promise<{
        success: boolean;
        error?: string;
        accountIds: string[];
        network: string;
      }>;
      sendTransaction: (transaction: any) => Promise<any>;
      disconnect: () => void;
    };
  }
}