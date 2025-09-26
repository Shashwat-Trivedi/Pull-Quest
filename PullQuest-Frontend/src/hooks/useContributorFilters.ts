"use client";

import { useMemo } from "react";
import type { User, DashboardFilters } from "../types";
import { getRankFromXP } from "../utils/rankUtils";

export const useContributorFilters = (
  users: User[],
  filters: DashboardFilters
) => {
  return useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.githubUsername
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (user.githubInfo.name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ??
          false);

      const userRank = getRankFromXP(user.xp);
      const matchesRank =
        filters.rankFilter === "all" || userRank.name === filters.rankFilter;
      const matchesStatus =
        filters.statusFilter === "all" ||
        (filters.statusFilter === "active" && user.isActive) ||
        (filters.statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRank && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (filters.sortOrder === "desc") {
        return b.xp - a.xp;
      } else {
        return a.xp - b.xp;
      }
    });
  }, [users, filters]);
};
