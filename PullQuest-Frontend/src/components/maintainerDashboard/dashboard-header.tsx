"use client";

import { useState } from "react"; // 1. Import useState
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Wallet } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HederaDashboardHeader } from "@/components/HederaDashboardHeader"; // 2. Import your Hedera header

export function DashboardHeader() {
  // 3. Add state to control which header is visible
  const [showHederaUI, setShowHederaUI] = useState(false);

  // 4. This function will be called to show the Hedera header
  const handleInitiateHederaConnection = () => {
    setShowHederaUI(true);
  };

  // 5. If showHederaUI is true, render the HederaDashboardHeader
  if (showHederaUI) {
    return <HederaDashboardHeader />;
  }

  // Otherwise, render the initial, simple header with the connect button
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center space-x-3">
            <span className="text-xl font-semibold text-gray-900">
              Pull Quest
            </span>
            <Badge
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Maintainer
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          {/* 6. This button now triggers the state change */}
          <Button onClick={handleInitiateHederaConnection} size="sm">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}