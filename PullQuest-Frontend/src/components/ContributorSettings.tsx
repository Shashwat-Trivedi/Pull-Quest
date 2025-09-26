"use client";

import { useState, useEffect } from "react";
import { useUser } from "../context/UserProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Github,
  MapPin,
  Mail,
  User,
  Save,
  RefreshCw,
  TrendingUp,
  Star,
  GitBranch,
  Calendar,
  Eye,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  githubUsername: string;
  githubInfo: {
    name?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
    public_repos: number;
    followers: number;
    following: number;
  };
  profile: {
    name?: string;
    bio?: string;
  };
  coins: number;
  xp: number;
  rank: string;
  createdAt: string;
}

interface LanguageData {
  name: string;
  percentage: number;
  color: string;
  repositories: number;
  totalBytes: number;
}

interface RepositoryData {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stargazersCount: number;
  forksCount: number;
  updatedAt: string;
  htmlUrl: string;
}

export default function ContributorSettings() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [topLanguages, setTopLanguages] = useState<LanguageData[]>([]);
  const [repositories, setRepositories] = useState<RepositoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form states
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8012";

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRepositories();
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      withCredentials: true,
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
    };
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/contributor/profile/${user?.id}`,
        getAuthHeaders()
      );
      
      if (response.data.success) {
        const profile = response.data.data.profile;
        setUserProfile(profile);
        setProfileName(profile.profile?.name || profile.githubInfo?.name || "");
        setProfileBio(profile.profile?.bio || profile.githubInfo?.bio || "");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRepositories = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/contributor/analyze-repositories`,
        {
          userId: user?.id,
          githubUsername: user?.githubUsername,
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        setRepositories(response.data.data.repositories || []);
        setTopLanguages(response.data.data.topLanguages?.map((lang: any, index: number) => ({
          name: lang,
          percentage: Math.max(20, 100 - index * 20), // Mock percentages
          color: getLanguageColor(lang),
          repositories: Math.floor(Math.random() * 10) + 1,
          totalBytes: Math.floor(Math.random() * 100000) + 10000,
        })) || []);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      JavaScript: "#f1e05a",
      TypeScript: "#2b7489",
      Python: "#3572A5",
      Java: "#b07219",
      Go: "#00ADD8",
      Rust: "#dea584",
      "C++": "#f34b7d",
      PHP: "#4F5D95",
      Ruby: "#701516",
      Swift: "#ffac45",
    };
    return colors[language] || "#64748b";
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Code Novice": return "bg-gray-100 text-gray-800";
      case "Code Apprentice": return "bg-green-100 text-green-800";
      case "Code Contributor": return "bg-blue-100 text-blue-800";
      case "Code Master": return "bg-purple-100 text-purple-800";
      case "Code Expert": return "bg-yellow-100 text-yellow-800";
      case "Open Source Legend": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE}/api/contributor/profile/${user?.id}`,
        {
          profile: {
            name: profileName,
            bio: profileBio,
          },
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        fetchUserProfile();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const analyzeRepositories = async () => {
    setAnalyzing(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/contributor/analyze-repositories`,
        {
          userId: user?.id,
          githubUsername: user?.githubUsername,
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success("Repository analysis completed!");
        fetchUserRepositories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze repositories");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <Button onClick={() => navigate("/contributor/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const xpProgress = ((userProfile.xp % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/contributor/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            </div>
            <Button
              onClick={() => navigate(`/contributor/profile/${userProfile.id}/public`)}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={userProfile.githubInfo.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.githubUsername[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-gray-900">
                  {userProfile.githubInfo.name || userProfile.githubUsername}
                </h2>
                <p className="text-gray-600">@{userProfile.githubUsername}</p>
                <Badge className={getRankColor(userProfile.rank)}>
                  {userProfile.rank}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userProfile.coins}</div>
                    <div className="text-sm text-gray-600">Coins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userProfile.xp}</div>
                    <div className="text-sm text-gray-600">XP</div>
                  </div>
                </div>

                {/* XP Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Next Rank Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>

                {/* GitHub Stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">GitHub Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Repositories:</span>
                      <span className="font-medium">{userProfile.githubInfo.public_repos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Followers:</span>
                      <span className="font-medium">{userProfile.githubInfo.followers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Following:</span>
                      <span className="font-medium">{userProfile.githubInfo.following}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{userProfile.email}</span>
                    </div>
                    {userProfile.githubInfo.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{userProfile.githubInfo.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(userProfile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="repositories">Repositories</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your display name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {profileBio.length}/500 characters
                      </p>
                    </div>

                    <Button onClick={saveProfile} disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="languages" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Top Programming Languages</span>
                    </CardTitle>
                    <Button onClick={analyzeRepositories} disabled={analyzing} variant="outline">
                      {analyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {topLanguages.length > 0 ? (
                      <div className="space-y-4">
                        {topLanguages.map((language) => (
                          <div key={language.name}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: language.color }}
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {language.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{language.percentage}%</div>
                                <div className="text-xs text-gray-500">
                                  {language.repositories} repos
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${language.percentage}%`,
                                  backgroundColor: language.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No language data available</p>
                        <Button onClick={analyzeRepositories} disabled={analyzing} className="mt-4">
                          Analyze Repositories
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="repositories" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <GitBranch className="w-5 h-5" />
                      <span>Public Repositories</span>
                    </CardTitle>
                    <Button onClick={analyzeRepositories} disabled={analyzing} variant="outline">
                      {analyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync with GitHub
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {repositories.length > 0 ? (
                      <div className="space-y-4">
                        {repositories.slice(0, 10).map((repo) => (
                          <div
                            key={repo.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {repo.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {repo.description || "No description provided"}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  {repo.language && (
                                    <div className="flex items-center space-x-1">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: getLanguageColor(repo.language),
                                        }}
                                      />
                                      <span>{repo.language}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4" />
                                    <span>{repo.stargazersCount}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <GitBranch className="w-4 h-4" />
                                    <span>{repo.forksCount}</span>
                                  </div>
                                  <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(repo.htmlUrl, "_blank")}
                              >
                                <Github className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No repositories found</p>
                        <Button onClick={analyzeRepositories} disabled={analyzing} className="mt-4">
                          Sync Repositories
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}