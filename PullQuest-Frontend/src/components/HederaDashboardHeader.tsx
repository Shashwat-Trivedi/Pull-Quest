"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Wallet,
  ChevronDown,
  Copy,
  LogOut,
  RefreshCw,
  AlertCircle,
  Hash, // Icon for Hedera
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useState } from "react";
import { toast } from "sonner";

// --- State to manage wallet connection ---
interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  accountId: string | null; // Can be Hedera ID or EVM address
  balance: string | null;
  walletType: "hedera" | "metamask" | null;
  error: string | null;
}

// --- SVG for MetaMask Icon ---
const MetaMaskIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="16px"
    height="16px"
    {...props}
  >
    <path
      fill="#f39c12"
      d="M45.6,22.8l-13-7.5c-0.7-0.4-1.6-0.4-2.3,0l-13,7.5c-0.7,0.4-1.1,1.1-1.1,1.9v15c0,0.8,0.5,1.5,1.1,1.9l13,7.5c0.7,0.4,1.6,0.4,2.3,0l13-7.5c0.7-0.4,1.1-1.1,1.1-1.9v-15C46.7,23.9,46.3,23.2,45.6,22.8z"
    />
    <path
      fill="#f39c12"
      d="M24,4,4,16v22.5c0,1.8,1.4,3.2,3.2,3.2h33.7c1.8,0,3.2-1.4,3.2-3.2V16L24,4z"
    />
    <path
      fill="#e67e22"
      d="M45.6,22.8l-13-7.5c-0.7-0.4-1.6-0.4-2.3,0l-13,7.5c-0.7,0.4-1.1,1.1-1.1,1.9v7.5c0,0.8,0.5,1.5,1.1,1.9l13,7.5c0.7,0.4,1.6,0.4,2.3,0l13-7.5c0.7-0.4,1.1-1.1,1.1-1.9v-7.5C46.7,23.9,46.3,23.2,45.6,22.8z"
    />
    <path
      fill="#d35400"
      d="M24,28.2L12.9,22.1l-9.6,5.5L13.8,33l9.6,5.5l10.7-6.2L44,27.6l-9.6-5.5L24,28.2z M24,38.4L13.8,33l9.6-5.5l10.1,5.8L24,38.4z"
    />
  </svg>
);

async function connectHederaWallet() {
  console.warn("Using placeholder for Hedera Wallet. Integrate HashPack for a real app.");
  const placeholderAccountId = "0.0.12345";
  const placeholderBalance = "1,234.5678";
  return {
    accountId: placeholderAccountId,
    balance: placeholderBalance
  };
}

async function connectMetaMask() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it from metamask.io");
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (accounts.length === 0) {
    throw new Error("No accounts found in MetaMask.");
  }

  const evmAddress = accounts[0];
  console.log("✅ MetaMask connected:", evmAddress);

  const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`);
  if (!response.ok) {
    // If the EVM address isn't linked to a Hedera account, the API returns a 404
    console.warn("No Hedera AccountId found for this EVM address.");
    return { accountId: evmAddress, balance: "N/A" };
  }
  
  const data = await response.json();
  const balanceInHbar = (data.balance?.balance || 0) / 100_000_000;

  // The 'account' can be null, so we default back to the EVM address
  const finalAccountId = data.account ?? evmAddress;

  return {
    accountId: finalAccountId,
    balance: balanceInHbar.toFixed(4)
  };
}


export function HederaDashboardHeader() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    accountId: null,
    balance: null,
    walletType: null,
    error: null,
  });

  const handleConnect = async (type: "hedera" | "metamask") => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      let result;
      if (type === "hedera") {
        result = await connectHederaWallet();
      } else {
        result = await connectMetaMask();
      }
      
      setWalletState({
        isConnected: true,
        isConnecting: false,
        accountId: result.accountId,
        balance: result.balance,
        walletType: type,
        error: null,
      });
      toast.success(`${type === 'hedera' ? 'Hedera Wallet' : 'MetaMask'} connected!`);

    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred.";
      setWalletState(prev => ({ ...prev, isConnecting: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  };

  const handleDisconnect = () => {
    setWalletState({
      isConnected: false,
      isConnecting: false,
      accountId: null,
      balance: null,
      walletType: null,
      error: null,
    });
    toast.success("Wallet disconnected");
  };
  
  const shortenAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const handleCopyAddress = async () => {
    if (walletState.accountId) {
      try {
        await navigator.clipboard.writeText(walletState.accountId);
        toast.success("Address copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy address");
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center space-x-3">
            <span className="text-xl font-semibold text-gray-900">Pull Quest</span>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
              Maintainer
            </Badge>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Hedera
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          {/* Error Alert */}
          {walletState.error && (
            <Alert className="w-auto bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-red-700">
                {walletState.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Wallet Connection */}
          {walletState.isConnected && walletState.accountId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-green-300 bg-green-50 hover:bg-green-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-green-800">
                        {shortenAddress(walletState.accountId)}
                      </span>
                      {walletState.balance && (
                        <span className="text-xs text-green-600">
                          {walletState.balance} {walletState.walletType === 'hedera' ? 'HBAR' : ''}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-green-700" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Connected Account</p>
                  <p className="text-xs text-gray-600">{walletState.accountId}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAddress}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      disabled={walletState.isConnecting}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {walletState.isConnecting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wallet className="w-4 h-4 mr-2" />
                      )}
                      {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Choose a wallet</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleConnect("hedera")}>
                            <Hash className="w-4 h-4 mr-2" />
                            Connect Hedera Wallet
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleConnect("metamask")}>
                            <MetaMaskIcon className="w-4 h-4 mr-2" />
                            Connect MetaMask
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
