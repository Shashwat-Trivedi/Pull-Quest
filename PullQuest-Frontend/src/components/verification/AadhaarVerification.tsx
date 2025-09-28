import React, { useState, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, AlertCircle, Smartphone, Wallet, Github } from 'lucide-react';
import { SelfQRcodeWrapper, SelfApp } from '@selfxyz/qrcode';
import { getUniversalLink } from '@selfxyz/core';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { selfProtocolService } from '../../services/selfProtocolService';
import { VerificationResult } from '../../types/selfProtocol';

interface AadhaarVerificationProps {
  walletAddress: string;
  githubUsername: string;
  onVerificationComplete: (result: VerificationResult) => void;
  onError: (error: string) => void;
}

/**
 * AadhaarVerification Component
 * 
 * This component handles the complete Aadhaar verification flow using official Self Protocol SDK:
 * 1. Generate SelfApp configuration for Self app verification
 * 2. Display QR code using official SelfQRcodeWrapper
 * 3. Handle success/error callbacks from Self Protocol
 * 4. Create DID and link identity
 */
export const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({
  walletAddress,
  githubUsername,
  onVerificationComplete,
  onError
}) => {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'scanning' | 'verifying' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');

  /**
   * Generate Self Protocol app configuration when component mounts
   */
  useEffect(() => {
    const generateSelfApp = async () => {
      try {
        console.log('🎯 Generating Aadhaar verification for:', { walletAddress, githubUsername });
        
        const app = await selfProtocolService.generateVerificationRequest(walletAddress, githubUsername);
        setSelfApp(app);
        setVerificationStatus('scanning');
        
        // Generate deep link for mobile users
        const link = getUniversalLink(app);
        setDeepLink(link);
        
      } catch (error) {
        console.error('❌ Failed to generate verification request:', error);
        setErrorMessage('Failed to generate verification request');
        setVerificationStatus('error');
        onError('Failed to generate verification request');
      }
    };

    generateSelfApp();
  }, [walletAddress, githubUsername, onError]);

  /**
   * Handle successful verification from Self Protocol
   */
  const handleVerificationSuccess = useCallback(async () => {
    try {
      console.log('✅ Self Protocol verification successful');
      setVerificationStatus('verifying');
      
      // Check if this is a mock app
      const isMockApp = (selfApp as any)?.isMock;
      
      if (isMockApp) {
        console.log('🧪 Using mock verification flow');
        
        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create mock verification result
        const mockResult: VerificationResult = {
          isValid: true,
          identity: {
            nationality: 'IND',
            gender: 'Unknown',
            olderThan: true,
            uniqueHash: `mock_${walletAddress}_${Date.now()}`
          },
          nullifier: `nullifier_${walletAddress}_${githubUsername}`,
          did: `did:self:mock_${walletAddress.slice(2, 10)}`
        };
        
        setVerificationStatus('success');
        console.log('✅ Mock Aadhaar verification completed successfully!');
        onVerificationComplete(mockResult);
        return;
      }
      
      // Real Self Protocol verification flow
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8012'}/api/self/verification-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          githubUsername
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.verified) {
          setVerificationStatus('success');
          console.log('✅ Aadhaar verification completed successfully!');
          onVerificationComplete(data.verificationResult);
        } else {
          throw new Error('Verification not found');
        }
      } else {
        throw new Error('Failed to check verification status');
      }
      
    } catch (error) {
      console.error('❌ Error handling verification success:', error);
      setVerificationStatus('error');
      setErrorMessage('Failed to complete verification');
      onError('Failed to complete verification');
    }
  }, [walletAddress, githubUsername, onVerificationComplete, onError]);

  /**
   * Handle verification error from Self Protocol
   */
  const handleVerificationError = useCallback((error: { error_code?: string; reason?: string }) => {
    console.error('❌ Self Protocol verification error:', error);
    setVerificationStatus('error');
    setErrorMessage(error.reason || 'Verification failed');
    onError(error.reason || 'Verification failed');
  }, [onError]);

  /**
   * Retry verification process
   */
  const handleRetry = () => {
    setVerificationStatus('pending');
    setErrorMessage('');
    setSelfApp(null);
    window.location.reload();
  };

  /**
   * Render different UI states based on verification status
   */
  const renderVerificationContent = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Preparing Aadhaar verification...</p>
          </div>
        );

      case 'scanning':
        const isMockApp = (selfApp as any)?.isMock;
        
        return (
          <div className="text-center space-y-6">
            {/* Show different UI for mock vs real Self Protocol */}
            {selfApp && (
              <div className="mx-auto bg-white p-4 rounded-lg shadow-lg">
                {isMockApp ? (
                  // Mock QR Code for development
                  <div className="space-y-4">
                    <div className="w-52 h-52 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
                      <div className="text-center">
                        <Shield className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-700">Mock Verification</p>
                        <p className="text-xs text-blue-500">Development Mode</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleVerificationSuccess}
                      className="w-full"
                      size="sm"
                    >
                      Simulate Verification Success
                    </Button>
                  </div>
                ) : (
                  // Real Self Protocol QR Code Component
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    onSuccess={handleVerificationSuccess}
                    onError={handleVerificationError}
                    size={200}
                    darkMode={false}
                  />
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Smartphone className="w-5 h-5" />
                <span className="font-semibold">
                  {isMockApp ? 'Mock Verification Mode' : 'Scan with Self App'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {isMockApp ? (
                  <>
                    <strong>Development Mode:</strong> Self Protocol network is unavailable. 
                    Using mock verification for testing. Click the button above to simulate verification.
                  </>
                ) : (
                  <>
                    Open the <strong>Self app</strong> on your phone and scan this QR code to verify your Aadhaar identity. 
                    This creates a privacy-preserving proof without sharing your personal details.
                  </>
                )}
              </p>
              
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  {isMockApp ? 'Mock proof' : 'Zero-knowledge proof'}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Privacy preserved
                </div>
              </div>
            </div>

            {/* Deep link for mobile users (only for real Self App) */}
            {deepLink && !isMockApp && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">On mobile?</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(deepLink, '_blank')}
                >
                  Open in Self App
                </Button>
              </div>
            )}
          </div>
        );

      case 'verifying':
        return (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Shield className="w-12 h-12 text-blue-500 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Verifying Aadhaar...</h3>
              <p className="text-gray-600">Processing your zero-knowledge proof</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-green-800">Verification Successful! 🎉</h3>
              <p className="text-gray-600">Your Aadhaar identity has been verified</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-center space-x-4 text-sm">
                <Badge variant="outline" className="bg-white">
                  <Github className="w-4 h-4 mr-1" />
                  {githubUsername}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <Wallet className="w-4 h-4 mr-1" />
                  {walletAddress.slice(0, 8)}...
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-red-800">Verification Failed</h3>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span>Aadhaar Verification</span>
        </CardTitle>
        <CardDescription>
          Verify your identity with Aadhaar through Self Protocol for sybil-resistant access
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderVerificationContent()}
        
        {/* Information Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Privacy Protected:</strong> Your Aadhaar details are never shared. Only cryptographic proofs 
            are generated to verify your uniqueness and eligibility.
          </AlertDescription>
        </Alert>
        
        {/* Benefits of verification */}
        {verificationStatus === 'scanning' && (
          <div className="text-xs text-gray-500 space-y-2">
            <p className="font-semibold">Benefits after verification:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Claim bounties and earn rewards</li>
              <li>Connect multiple wallets to one identity</li>
              <li>Participate in governance voting</li>
              <li>Build verifiable reputation</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AadhaarVerification;