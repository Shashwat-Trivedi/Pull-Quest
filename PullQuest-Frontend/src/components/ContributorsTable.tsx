"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Github,
  UserCheck,
  UserX,
  Eye,
  MapPin,
  Users,
} from "lucide-react";
import type { User } from "../types";
import { getRankFromXP } from "../utils/rankUtils";

interface ContributorsTableProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

export const ContributorsTable: React.FC<ContributorsTableProps> = ({
  users,
  onUserSelect,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No contributors found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contributor</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>XP Points</TableHead>
            <TableHead>Repositories</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const userRank = getRankFromXP(user.xp);
            return (
              <TableRow
                key={user._id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={user.githubInfo.avatar_url || "/placeholder.svg"}
                        alt={user.githubInfo.name || user.githubUsername}
                      />
                      <AvatarFallback>
                        {user.githubInfo.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") ||
                          user.githubUsername.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.githubInfo.name || user.githubUsername}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{user.githubUsername}
                      </p>
                      {user.githubInfo.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.githubInfo.location}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={userRank.color} variant="secondary">
                    {userRank.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">
                      {user.xp.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <span>{user.githubInfo.public_repos}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(user.lastLogin)}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUserSelect(user)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
