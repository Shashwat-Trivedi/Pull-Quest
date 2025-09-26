"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@/context/UserProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Search,
  PlusCircle,
  ExternalLink,
  Calendar,
  User,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Github,
  Eye,
  FileText,
} from "lucide-react";
import { IssueCardProps } from "@/components/IssueCard";
import axios from "axios";
import { toast } from "sonner";

interface BountyIssue extends IssueCardProps {
  id: string;
  repository: {
    name: string;
    fullName: string;
    htmlUrl: string;
    language?: string;
  };
  stakeAmount: number;
  bountyAmount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "open" | "in_progress" | "completed" | "closed";
  applicantsCount: number;
  viewsCount: number;
  totalPayout: number;
}

interface BountyStats {
  totalIssues: number;
  totalBountyAmount: number;
  totalStakeAmount: number;
  activeIssues: number;
  completedIssues: number;
  inProgressIssues: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function BountyIssuesByMe() {
  const { user } = useUser();
  const [issues, setIssues] = useState<BountyIssue[]>([]);
  const [stats, setStats] = useState<BountyStats>({
    totalIssues: 0,
    totalBountyAmount: 0,
    totalStakeAmount: 0,
    activeIssues: 0,
    completedIssues: 0,
    inProgressIssues: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8012";

  useEffect(() => {
    fetchBountyIssues();
  }, [user, currentPage, statusFilter, difficultyFilter]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      withCredentials: true,
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
    };
  };

  const fetchBountyIssues = async () => {
    if (!user?.githubUsername) {
      console.log("⚠️ No GitHub username found for user");
      return;
    }

    try {
      setLoading(true);
      console.log("🚀 Fetching bounty issues with params:", {
        githubUsername: user.githubUsername,
        page: currentPage,
        per_page: 20,
        status: statusFilter,
        difficulty: difficultyFilter
      });

      const response = await axios.get(
        `${API_BASE}/api/maintainer/bounty-issues`,
        {
          params: { 
            githubUsername: user.githubUsername,
            page: currentPage,
            per_page: 20,
            status: statusFilter,
            difficulty: difficultyFilter
          },
          ...getAuthHeaders(),
        }
      );

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        const { issues, stats, pagination } = response.data.data;
        
        setIssues(issues || []);
        setStats(stats || {
          totalIssues: 0,
          totalBountyAmount: 0,
          totalStakeAmount: 0,
          activeIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
        });
        
        if (pagination) {
          setPagination(pagination);
        }

        console.log("📊 Updated state:", {
          issuesCount: issues?.length || 0,
          stats: stats,
          pagination: pagination
        });
      } else {
        toast.error("Failed to fetch bounty issues: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("❌ Error fetching bounty issues:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch bounty issues";
      toast.error(errorMessage);
      
      // Set empty state on error
      setIssues([]);
      setStats({
        totalIssues: 0,
        totalBountyAmount: 0,
        totalStakeAmount: 0,
        activeIssues: 0,
        completedIssues: 0,
        inProgressIssues: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleStatusFilterChange = (newStatus: string) => {
    console.log("🔄 Status filter changed:", newStatus);
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDifficultyFilterChange = (newDifficulty: string) => {
    console.log("🔄 Difficulty filter changed:", newDifficulty);
    setDifficultyFilter(newDifficulty);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    console.log("📄 Page changed:", page);
    setCurrentPage(page);
  };

  // Client-side search filtering (since search is handled locally)
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = searchTerm === "" || (
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.repository.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bounty issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bounty Issues</h1>
                <p className="text-gray-600">
                  Manage and track issues you've created with bounties
                </p>
              </div>
            </div>
            <Link to="/maintainer/new-issue">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
                  <p className="text-xs text-gray-600">Total Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBountyAmount}ℏ</p>
                  <p className="text-xs text-gray-600">Total Bounties</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStakeAmount}ℏ</p>
                  <p className="text-xs text-gray-600">Total Stakes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeIssues}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressIssues}</p>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedIssues}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by issue title or repository..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={handleDifficultyFilterChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {issues.length === 0 ? "No bounty issues created yet" : "No issues match your filters"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {issues.length === 0 
                    ? "Create your first bounty issue to get started with rewarding contributors."
                    : "Try adjusting your search terms or filters to find more issues."
                  }
                </p>
                {issues.length === 0 && (
                  <Link to="/maintainer/new-issue">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Your First Bounty Issue
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="border hover:border-gray-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">#{issue.number}</Badge>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getDifficultyColor(issue.difficulty)}>
                              {issue.difficulty}
                            </Badge>
                            {issue.labels.map((label, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                style={{
                                  backgroundColor: `#${label.color || 'e1e4e8'}20`,
                                  borderColor: `#${label.color || 'e1e4e8'}40`,
                                  color: `#${label.color || '586069'}`,
                                }}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {issue.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {issue.repository.fullName}
                          </p>
                          {issue.body && (
                            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                              {issue.body}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{issue.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{issue.createdAt}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{issue.comments} comments</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{issue.applicantsCount} applicants</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{issue.viewsCount} views</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Bounty & Stake Info */}
                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-green-600 font-semibold">
                                {issue.bountyAmount}ℏ bounty
                              </span>
                              <span className="text-orange-600 font-semibold">
                                {issue.stakeAmount}ℏ stake
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Total: {issue.totalPayout}ℏ HBAR
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(issue.htmlUrl, "_blank")}
                            >
                              <Github className="w-4 h-4 mr-1" />
                              GitHub
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(issue.repository.htmlUrl, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Repository
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} bounty issues
            </p>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + Math.max(1, pagination.currentPage - 2);
                if (page > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary for single page */}
        {pagination.totalPages <= 1 && filteredIssues.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredIssues.length} of {issues.length} bounty issues
            </p>
          </div>
        )}
      </div>
    </div>
  );
}