"use client";

import { useState, useEffect, useCallback } from 'react';

// Declare global window extensions for wallets
declare global {
  interface Window {
    hashpack?: any;
    blade?: any;
    ethereum?: any;
  }
}

interface HederaWalletState {
  isConnected: boolean;
  accountId: string | null;
  balance: string | null;
  network: string;
  isConnecting: boolean;
  error: string | null;
  walletType: string | null;
  // --- 1. ADDITION: State to track available wallets ---
  walletsAvailable: {
    hashpack: boolean;
    blade: boolean;
    metamask: boolean;
  };
}

// Add the new walletsAvailable state to the return type
interface UseHederaWalletReturn extends HederaWalletState {
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export const useHederaWallet = (): UseHederaWalletReturn => {
  const [state, setState] = useState<HederaWalletState>({
    isConnected: false,
    accountId: null,
    balance: null,
    network: 'testnet',
    isConnecting: false,
    error: null,
    walletType: null,
    // Initialize the new state
    walletsAvailable: {
      hashpack: false,
      blade: false,
      metamask: false,
    },
  });
  
  // --- 2. ADDITION: Proactively check for wallets when the component mounts ---
  useEffect(() => {
    // This check runs only once after the initial render
    setState(prev => ({
      ...prev,
      walletsAvailable: {
        hashpack: !!window.hashpack,
        blade: !!window.blade,
        metamask: !!window.ethereum,
      },
    }));
  }, []);


  // HashPack Connection
  const connectHashPack = async () => {
    if (!window.hashpack) {
      throw new Error('HashPack wallet is not installed. Please install it from hashpack.app');
    }

    try {
      const connectData = await window.hashpack.connectToLocalWallet();
      
      if (connectData.accountIds && connectData.accountIds.length > 0) {
        const accountId = connectData.accountIds[0];
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          accountId: accountId.toString(),
          walletType: 'HashPack',
        }));

        await fetchBalance(accountId.toString());
      } else {
        throw new Error('No accounts found in HashPack');
      }
    } catch (error: any) {
      throw new Error(`HashPack connection failed: ${error.message}`);
    }
  };

  // Blade Wallet Connection
  const connectBlade = async () => {
    if (!window.blade) {
      throw new Error('Blade wallet is not installed. Please install it from bladewallet.io');
    }

    try {
      const connectData = await window.blade.getAccountInfo();
      
      if (connectData && connectData.accountId) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          accountId: connectData.accountId,
          walletType: 'Blade',
        }));

        await fetchBalance(connectData.accountId);
      } else {
        throw new Error('Failed to get account from Blade wallet');
      }
    } catch (error: any) {
      throw new Error(`Blade wallet connection failed: ${error.message}`);
    }
  };

  // MetaMask Connection for Hedera
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install it from metamask.io');
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x128' }], // Hedera Testnet
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x128',
              chainName: 'Hedera Testnet',
              nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
              rpcUrls: ['https://testnet.hashio.io/api'],
              blockExplorerUrls: ['https://hashscan.io/testnet'],
            }],
          });
        } else {
          throw switchError;
        }
      }

      const ethAddress = accounts[0];
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        accountId: ethAddress,
        walletType: 'MetaMask',
        balance: 'N/A', // Balance fetch is not implemented for MetaMask
      }));

    } catch (error: any) {
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  };

  // Fetch balance from Hedera Mirror Node API
  const fetchBalance = async (accountId: string) => {
    try {
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const balanceInHbar = (data.balance?.balance || 0) / 100_000_000;
        
        setState(prev => ({
          ...prev,
          balance: balanceInHbar.toFixed(4),
        }));
      } else {
        setState(prev => ({ ...prev, balance: 'N/A' }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, balance: 'N/A' }));
    }
  };

  const connect = useCallback(async (walletType: string) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      switch (walletType.toLowerCase()) {
        case 'hashpack':
          await connectHashPack();
          break;
        case 'blade':
          await connectBlade();
          break;
        case 'metamask':
          await connectMetaMask();
          break;
        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error: any) {
      // --- 3. CORRECTION: Gracefully handle the error instead of crashing ---
      setState(prev => ({
        ...prev,
        error: error.message, // Store the error message in the state
        isConnecting: false,
      }));
      // We removed "throw error;" here so the app doesn't crash.
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({
        ...prev, // Keep walletsAvailable state
        isConnected: false,
        accountId: null,
        balance: null,
        isConnecting: false,
        error: null,
        walletType: null,
    }));
  }, []);

  const refreshBalance = useCallback(async () => {
    if (state.accountId && state.walletType !== 'MetaMask') {
      await fetchBalance(state.accountId);
    }
  }, [state.accountId, state.walletType]);

  // Listener for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.walletType === 'MetaMask') {
        setState(prev => ({ ...prev, accountId: accounts[0] }));
      }
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [state.walletType, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
  };
};