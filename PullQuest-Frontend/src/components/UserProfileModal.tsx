import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Github,
  MapPin,
  Calendar,
  Coins,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { User, RecentStake } from "../types";
import { getRankFromXP, getXPProgress } from "../utils/rankUtils";

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StakeCardProps {
  stake: RecentStake;
  index: number;
}

const StakeCard: React.FC<StakeCardProps> = ({ stake, index }) => {
  const getStakeCardStyle = (type: string): string => {
    switch (type) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getStakeIcon = (type: string) => {
    switch (type) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStakeDescription = (stake: RecentStake): string => {
    if (stake.type === "completed") {
      return `${stake.status} • +${stake.coinsEarned} coins`;
    } else if (stake.type === "pending") {
      return `${stake.status} • ${stake.coinsStaked} coins staked`;
    } else {
      return `${stake.status} • ${stake.coinsRequired} coins`;
    }
  };

  const getStakeValue = (stake: RecentStake) => {
    if (stake.type === "completed") {
      return (
        <span className="text-green-600 font-semibold">+{stake.xpEarned}</span>
      );
    } else if (stake.type === "pending") {
      return (
        <span className="text-yellow-600 font-semibold">-{stake.xpStaked}</span>
      );
    } else {
      return (
        <Button size="sm" variant="outline">
          Stake
        </Button>
      );
    }
  };

  return (
    <Card key={index} className={`p-4 ${getStakeCardStyle(stake.type)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStakeIcon(stake.type)}
          <div>
            <p className="font-medium">{stake.title}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {getStakeDescription(stake)}
            </p>
          </div>
        </div>
        <div className="text-right">{getStakeValue(stake)}</div>
      </div>
    </Card>
  );
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const userRank = getRankFromXP(user.xp);
  const xpProgress = getXPProgress(user.xp);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={user.githubInfo.avatar_url || "/placeholder.svg"}
                  alt={user.githubInfo.name || user.githubUsername}
                />
                <AvatarFallback className="text-lg">
                  {user.githubInfo.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || user.githubUsername.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {user.githubInfo.name || user.githubUsername}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={userRank.color} variant="secondary">
                    {userRank.name}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold">
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant={user.isActive ? "default" : "secondary"}
              className="text-sm"
            >
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">@{user.githubUsername}</span>
            </div>
            {user.githubInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.githubInfo.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>

          {user.githubInfo.bio && (
            <div>
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-sm text-muted-foreground">
                {user.githubInfo.bio}
              </p>
            </div>
          )}

          {/* Virtual Coins */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Virtual Coins</h4>
                <Coins className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {user.coins.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                +{user.weeklyCoinsEarned} earned this week
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">XP Progress</h4>
                <span className="text-sm text-muted-foreground">
                  {xpProgress.xpToNext > 0
                    ? `${xpProgress.xpToNext} XP to next rank`
                    : "Max rank achieved"}
                </span>
              </div>
              <Progress value={xpProgress.progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Recent Stakes */}
          {user.recentStakes && user.recentStakes.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">Recent Stakes</h4>
              <div className="space-y-3">
                {user.recentStakes.map((stake, index) => (
                  <StakeCard key={index} stake={stake} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* GitHub Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {user.githubInfo.public_repos}
                </div>
                <div className="text-sm text-muted-foreground">
                  Repositories
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {user.githubInfo.followers}
                </div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Contact Contributor
            </Button>
            <Button variant="outline" className="flex-1">
              <Github className="w-4 h-4 mr-2" />
              View GitHub Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
