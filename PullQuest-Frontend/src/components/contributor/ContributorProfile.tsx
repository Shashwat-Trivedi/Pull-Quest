"use client"

import { NavigationTabs } from "@/components/contributor/navigation-tabs";
import { ProfileSidebar } from "@/components/contributor/profile-sidebar";
import { ProgressBar } from "@/components/contributor/progress-bar";
import { StakesList } from "@/components/contributor/stakes-list";
import { StatsCards } from "@/components/contributor/stats-cards";
import { useState } from "react"

const GitHubContributorProfile = () => {
  const [activeTab, setActiveTab] = useState("profile")

  // Sample user data
  const userData = {
    name: "Arun Kumar Kushwaha",
    username: "ArunKushhhh",
    role: "Contributor",
    bio: "Designer | Developer🥂",
    location: "Pune, Maharashtra",
    coins: 1250,
    xp: 2750,
    avatar: "",
    socialLinks: {
      github: "https://github.com/ArunKushhhh",
      linkedin: "https://www.linkedin.com/in/arun-kumar-kushwaha-b26085286/",
      twitter: "https://twitter.com/alexdev",
    },
  }

  // Top languages data
  const topLanguages = [
    { name: "JavaScript", percentage: 35, color: "#f1e05a" },
    { name: "Python", percentage: 25, color: "#3572A5" },
    { name: "TypeScript", percentage: 20, color: "#2b7489" },
    { name: "Go", percentage: 12, color: "#00ADD8" },
    { name: "Rust", percentage: 8, color: "#dea584" },
  ]

  // Sample stakes data
  const stakesData = [
    {
      id: 1,
      status: "Accepted",
      issue: "Fix authentication bug in login flow",
      repository: "auth-service",
      owner: "company-org",
      coinsStaked: 150,
      coinsGained: 300,
      xpGained: 75,
      dateClosed: "2024-06-10",
    },
    {
      id: 2,
      status: "Pending",
      issue: "Implement dark mode toggle",
      repository: "ui-components",
      owner: "design-team",
      coinsStaked: 200,
      coinsGained: 0,
      xpGained: 0,
      dateClosed: null,
    },
    {
      id: 3,
      status: "Rejected",
      issue: "Optimize database queries",
      repository: "backend-api",
      owner: "data-team",
      coinsStaked: 100,
      coinsGained: -50,
      xpGained: -10,
      dateClosed: "2024-06-08",
    },
    {
      id: 4,
      status: "Expired",
      issue: "Add unit tests for user service",
      repository: "user-management",
      owner: "testing-org",
      coinsStaked: 75,
      coinsGained: 0,
      xpGained: 0,
      dateClosed: "2024-06-05",
    },
  ]

  const getRank = (xp: number) => {
    if (xp >= 5000) return "Open Source Legend"
    if (xp >= 3000 && xp < 5000) return "Code Expert"
    if (xp >= 1500 && xp < 3000) return "Code Master"
    if (xp >= 500 && xp < 1500) return "Code Contributor"
    if (xp >= 100 && xp < 500) return "Code Apprentice"
    return "Code Novice"
  }

  const getNextRankXP = (xp: number) => {
    if (xp >= 5000) return 5000
    if (xp >= 3000) return 5000
    if (xp >= 1500) return 3000
    if (xp >= 500) return 1500
    if (xp >= 100) return 500
    return 100
  }

  const currentRank = getRank(userData.xp)
  const nextRankXP = getNextRankXP(userData.xp)
  const xpToNext = nextRankXP - userData.xp

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          <ProfileSidebar userData={userData} topLanguages={topLanguages} />

          {/* Main Content */}
          <div className="flex-1">
            <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "profile" && (
              <>
                <StatsCards coins={userData.coins} xp={userData.xp} currentRank={currentRank} xpToNext={xpToNext} />

                {xpToNext > 0 && (
                  <ProgressBar currentXP={userData.xp} nextRankXP={nextRankXP} nextRankName={getRank(nextRankXP)} />
                )}

                <StakesList stakes={stakesData} />
              </>
            )}

            {activeTab === "repositories" && (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Repositories</h2>
                <p className="text-neutral-600">Repository content will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubContributorProfile
