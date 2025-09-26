"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui

interface MapAddressButtonProps {
  githubUsername: string;
  userAddress: string;
}

export const MapAddressButton = ({ githubUsername, userAddress }: MapAddressButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleMapAddress = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Basic validation
    if (!githubUsername || !userAddress) {
      setError("GitHub username and address are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v2/admin/map-github-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername,
          userAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to map address');
      }

      setResult(data);
      console.log("Mapping successful:", data);

    } catch (err: any) {
      setError(err.message);
      console.error("Mapping error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-3">
      <Button onClick={handleMapAddress} disabled={isLoading}>
        {isLoading ? 'Mapping...' : 'Map GitHub Address'}
      </Button>
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      {result && (
        <p className="text-sm text-green-600">
          Success! Mapped {result.githubUsername} to {result.userAddress}. Tx: {result.txHash.slice(0, 10)}...
        </p>
      )}
    </div>
  );
};