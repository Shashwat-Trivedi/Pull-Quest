"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui

interface ScheduleTransferButtonProps {
  issueId: number;
  githubUsername: string;
  amount: number;
  delayInSeconds: number;
}

export const ScheduleTransferButton = ({ issueId, githubUsername, amount, delayInSeconds }: ScheduleTransferButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleScheduleTransfer = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Remember to use the corrected path with the leading slash!
      const response = await fetch('http://localhost:8000/api/v2/schedule-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueId,
          githubUsername,
          amount,
          delayInSeconds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule transfer');
      }

      setResult(data);
      console.log("Scheduling successful:", data);

    } catch (err: any) {
      setError(err.message);
      console.error("Scheduling error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-3">
      <Button onClick={handleScheduleTransfer} disabled={isLoading}>
        {isLoading ? 'Scheduling...' : 'Schedule HBAR Transfer'}
      </Button>
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      {result && (
        <p className="text-sm text-green-600">
          Success! Transfer ID: {result.transferId}. Tx: {result.txHash.slice(0, 10)}...
        </p>
      )}
    </div>
  );
};