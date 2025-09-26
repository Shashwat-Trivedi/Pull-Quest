"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SortDesc, SortAsc } from "lucide-react";
import type { DashboardFilters } from "../types";
import { RANKS } from "../utils/rankUtils";

interface SearchAndFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="search">Search Contributors</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="search"
            placeholder="Search by username, email, or name..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div>
          <Label htmlFor="rank-filter" className="block mb-2">
            Rank
          </Label>
          <Select
            value={filters.rankFilter}
            onValueChange={(value) => onFiltersChange({ rankFilter: value })}
          >
            <SelectTrigger id="rank-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              {RANKS.map((rank) => (
                <SelectItem key={rank.name} value={rank.name}>
                  {rank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status-filter" className="block mb-2">
            Status
          </Label>
          <Select
            value={filters.statusFilter}
            onValueChange={(value) => onFiltersChange({ statusFilter: value })}
          >
            <SelectTrigger id="status-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sort-xp" className="block mb-2">
            Sort XP
          </Label>
          <Button
            id="sort-xp"
            variant="outline"
            onClick={() =>
              onFiltersChange({
                sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
              })
            }
            className="w-32 h-10"
          >
            {filters.sortOrder === "desc" ? (
              <>
                <SortDesc className="w-4 h-4 mr-2" />
                High to Low
              </>
            ) : (
              <>
                <SortAsc className="w-4 h-4 mr-2" />
                Low to High
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
