"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Star,
  Calendar,
  User,
  MessageCircle,
  ExternalLink,
  Coins,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle2,
  Github,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface User {
  id: string;
  githubUsername: string;
  // …other existing props…
  coins: number;       // ← add this
}

interface IssueDetails {
  id: number;
  number: number;
  title: string;
  body: string;
  user: {
    login: string;
    avatarUrl: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  repository: {
    name: string;
    fullName: string;
    htmlUrl: string;
    stargazersCount: number;
    language: string;
    description: string;
  };
  difficulty: "beginner" | "intermediate" | "advanced";
  bounty: number;
  xpReward: number;
  stakingRequired: number;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  estimatedHours: number;
}

export default function IssueDetailsPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState<IssueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [prUrl, setPrUrl] = useState("");
  const [staking, setStaking] = useState(false);
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8012";

  useEffect(() => {
    if (issueId) {
      fetchIssueDetails();
    }
  }, [issueId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      withCredentials: true,
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
    };
  };

  const fetchIssueDetails = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/contributor/issue-details/${issueId}`,
        {
          userId: user?.id,
          githubUsername: user?.githubUsername,
        },
        getAuthHeaders()
      );
      
      if (response.data.success) {
        setIssue(response.data.data.issue);
        setStakeAmount(response.data.data.bounty.stakingRequired);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch issue details");
      navigate("/contributor/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleStakeSubmit = async () => {
    if (!user || !issue || !prUrl.trim()) {
      toast.error("Please provide a valid PR URL");
      return;
    }

    setStaking(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/contributor/stakes`,
        {
          userId: user.id,
          issueId: issue.id,
          repository: issue.repository.fullName,
          amount: stakeAmount,
          prUrl: prUrl.trim(),
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success("Stake created successfully! Good luck with your PR!");
        setStakeDialogOpen(false);
        navigate("/contributor/dashboard", { state: { tab: "stakes" } });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create stake");
    } finally {
      setStaking(false);
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
          <p className="text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-4">The issue you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/contributor/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/contributor/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.open(issue.htmlUrl, "_blank")}
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">#{issue.number}</Badge>
                      <Badge className={getDifficultyColor(issue.difficulty)}>
                        {issue.difficulty}
                      </Badge>
                      {issue.labels.map((label, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            borderColor: `#${label.color}40`,
                            color: `#${label.color}`,
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-2xl text-gray-900 leading-tight">
                      {issue.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Opened by {issue.user.login}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{issue.commentsCount} comments</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {issue.body || "No description provided."}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Repository Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Github className="w-5 h-5" />
                  <span>Repository Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {issue.repository.fullName}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {issue.repository.description || "No description available."}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>{issue.repository.language}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{issue.repository.stargazersCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(issue.repository.htmlUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Repository
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bounty Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Bounty Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    +{issue.bounty}
                  </div>
                  <div className="text-sm text-gray-600">Coins Reward</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">+{issue.xpReward}</div>
                    <div className="text-xs text-gray-600">XP Points</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{issue.estimatedHours}h</div>
                    <div className="text-xs text-gray-600">Estimated</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Required Stake:</span>
                    <span className="font-semibold text-gray-900">
                      {issue.stakingRequired} coins
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    You'll need to stake {issue.stakingRequired} coins to work on this issue.
                    Your stake will be returned if your PR is merged.
                  </p>
                </div>

                <Button
                  onClick={() => setStakeDialogOpen(true)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  // disabled={!user || (user.coins || 0) < issue.stakingRequired}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Stake & Start Working
                </Button>

                {/* {user && (user.coins || 0) < issue.stakingRequired && (
                  <p className="text-xs text-red-600 text-center">
                    Insufficient coins. You need {issue.stakingRequired - (user.coins || 0)} more coins.
                  </p>
                )} */}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <Badge className={getDifficultyColor(issue.difficulty)}>
                    {issue.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comments:</span>
                  <span className="text-sm font-medium">{issue.commentsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Updated:</span>
                  <span className="text-sm font-medium">
                    {new Date(issue.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  New to contributing? Check out our guide on how to get started.
                </p>
                <Button variant="outline" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Contribution Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stake Dialog */}
      <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span>Stake Coins for This Issue</span>
            </DialogTitle>
            <DialogDescription>
              Submit your PR URL and stake {issue.stakingRequired} coins to work on this issue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important:</p>
                  <p>
                    Your stake will be returned if your PR is merged. Only a small amount
                    may be deducted if your PR is reviewed but not merged.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="prUrl">Pull Request URL *</Label>
              <Input
                id="prUrl"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide the URL of your pull request that addresses this issue.
              </p>
            </div>

            <div>
              <Label htmlFor="stakeAmount">Stake Amount</Label>
              <div className="mt-1 relative">
                <Input
                  id="stakeAmount"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  min={issue.stakingRequired}
                  max={issue.stakingRequired}
                  disabled
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  coins
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Stake amount is fixed for this issue.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span>Your current balance:</span>
                {/* <span className="font-medium">{user?.coins || 0} coins</span> */}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Stake amount:</span>
                <span className="font-medium">-{stakeAmount} coins</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                <span className="font-medium">Balance after stake:</span>
                <span className="font-bold">
                  {/* {(user?.coins || 0) - stakeAmount} coins */}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStakeDialogOpen(false)}
              disabled={staking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStakeSubmit}
              disabled={staking || !prUrl.trim()}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {staking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Staking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Stake
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}