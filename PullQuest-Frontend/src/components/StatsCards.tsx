import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Crown } from "lucide-react";

interface StatsCardsProps {
  totalContributors: number;
  activeContributors: number;
  averageXP: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalContributors,
  activeContributors,
  averageXP,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total Contributors</p>
              <p className="text-2xl font-bold">{totalContributors}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Active Contributors</p>
              <p className="text-2xl font-bold">{activeContributors}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Average XP</p>
              <p className="text-2xl font-bold">{averageXP.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
