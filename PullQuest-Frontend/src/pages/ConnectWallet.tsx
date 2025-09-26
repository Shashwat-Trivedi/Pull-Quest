import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet, ArrowRight, Github, CheckCircle, Hash, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

// Hedera Wallet Connect imports (you'll need to install these)
// import { DAppConnector, HederaChainId, HederaJsonRpcMethod, HederaSessionEvent } from '@hashgraph/hedera-wallet-connect';
// import { LedgerId } from '@hashgraph/sdk';

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  accountId: string | null;
  balance: string | null;
  walletType: "hedera" | "metamask" | null;
  error: string | null;
}

const MetaMaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 318 318" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E17726" d="m274.1 35.5-99.5 73.9L193 65.8z"/>
    <path fill="#E27625" d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"/>
    <path fill="#E27625" d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z"/>
  </svg>
);

const HederaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E936F2" d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm7.5 22.5h-15v-5h15v5zm0-7.5h-15v-5h15v5z"/>
  </svg>
);

export default function ConnectWallet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    accountId: null,
    balance: null,
    walletType: null,
    error: null,
  });

  // GitHub context
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const issue = searchParams.get('issue');
  const isFromGitHub = owner && repo;

  // Hedera Wallet Connection using HashPack
  const connectHederaWallet = async () => {
    try {
      // Check if HashPack extension is installed
      const checkHashPack = () => {
        return new Promise((resolve) => {
          // HashPack injects itself as window.hashpack
          if (window.hashpack) {
            resolve(true);
            return;
          }
          
          // Sometimes it takes a moment to inject
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            if (window.hashpack) {
              clearInterval(checkInterval);
              resolve(true);
            } else if (attempts > 10) { // 1 second timeout
              clearInterval(checkInterval);
              resolve(false);
            }
          }, 100);
        });
      };

      const hashpackAvailable = await checkHashPack();
      
      if (!hashpackAvailable) {
        throw new Error('HashPack wallet extension is not installed. Please install HashPack from the Chrome Web Store and refresh the page.');
      }

      console.log('Connecting to HashPack wallet...');
      
      const appMetadata = {
        name: 'DevReward Platform',
        description: 'Connect to earn rewards for your contributions',
        icon: window.location.origin + '/favicon.ico'
      };

      // Connect to HashPack
      const connectionResult = await window.hashpack.connectToLocalWallet(appMetadata);
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Failed to connect to HashPack wallet. Please make sure HashPack is unlocked.');
      }

      // Get the first account ID
      const accountId = connectionResult.accountIds?.[0];
      if (!accountId) {
        throw new Error('No accounts found in HashPack wallet');
      }

      console.log('Connected to HashPack account:', accountId);

      // Fetch account balance from Hedera Mirror Node
      let balance = 'N/A';
      try {
        const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
        if (response.ok) {
          const data = await response.json();
          const balanceInTinybars = data.balance?.balance || 0;
          balance = (balanceInTinybars / 100_000_000).toFixed(4); // Convert tinybars to HBAR
        } else {
          console.warn('Could not fetch balance from mirror node');
        }
      } catch (balanceError) {
        console.warn('Could not fetch balance:', balanceError);
      }

      return { 
        accountId, 
        balance 
      };

    } catch (error) {
      console.error('Hedera connection error:', error);
      throw error;
    }
  };

  // MetaMask Connection
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });
      
      // Convert from wei to ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      
      return { 
        accountId: account, 
        balance: balanceInEth 
      };
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw new Error('Failed to connect to MetaMask');
    }
  };

  // Handle wallet connection
  const handleConnect = async (type: "hedera" | "metamask") => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      let result;
      
      if (type === "hedera") {
        result = await connectHederaWallet();
      } else {
        result = await connectMetaMask();
      }
      
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        accountId: result.accountId,
        balance: result.balance,
        walletType: type,
        error: null,
      }));

      toast.success(`${type === 'hedera' ? 'Hedera Wallet' : 'MetaMask'} connected successfully!`);
      
      // Create user account
      await createUserAccount(result.accountId, type);
      
    } catch (error: any) {
      setWalletState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message 
      }));
      toast.error(error.message);
    }
  };

  // Create user account
  const createUserAccount = async (walletAddress: string, walletType: string) => {
    try {
      const githubUsername = searchParams.get('github') || 'contributor';
      
      const response = await fetch('http://localhost:8012/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          githubUsername,
          walletType,
          role: 'contributor'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Account created! Welcome ${data.user.githubUsername}`);
      }
    } catch (error) {
      console.warn('Account creation failed, but wallet is connected');
    }
  };

  // Navigate to next page
  const handleContinue = () => {
    if (isFromGitHub && issue) {
      navigate(`/contributor/issue/${issue}`);
    } else {
      navigate('/contributor/dashboard');
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Connect Your Wallet</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect your wallet to start earning rewards for your contributions
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

        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Wallet</CardTitle>
              <CardDescription>
                Select your preferred wallet to connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Display */}
              {walletState.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {walletState.error}
                  </AlertDescription>
                </Alert>
              )}

              {!walletState.isConnected ? (
                <div className="space-y-3">
                  {/* Hedera Wallet Button */}
                  <Button
                    onClick={() => handleConnect("hedera")}
                    disabled={walletState.isConnecting}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {walletState.isConnecting ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <HederaIcon />
                        <span className="ml-2">Connect Hedera Wallet</span>
                      </div>
                    )}
                  </Button>

                  {/* MetaMask Button */}
                  <Button
                    onClick={() => handleConnect("metamask")}
                    disabled={walletState.isConnecting}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600"
                    size="lg"
                  >
                    {walletState.isConnecting ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MetaMaskIcon />
                        <span className="ml-2">Connect MetaMask</span>
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Success State */}
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Wallet Connected!</span>
                          <Badge variant="outline">
                            {walletState.walletType === 'hedera' ? 'Hedera' : 'MetaMask'}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div>Address: <code>{formatAddress(walletState.accountId!)}</code></div>
                          {walletState.balance && (
                            <div>
                              Balance: {walletState.balance} {walletState.walletType === 'hedera' ? 'HBAR' : 'ETH'}
                            </div>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Continue Button */}
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
                </div>
              )}
            </CardContent>
          </Card>

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