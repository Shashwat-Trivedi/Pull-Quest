// src/pages/RepoPrs.tsx
"use client"

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useUser } from "../context/UserProvider"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import {
  GitPullRequest,
  ArrowLeft,
  AlertCircle,
  Plus,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PRCard from "@/components/PRsCard"

interface RawPR {
  number: number
  title: string
  body: string
  user: { login: string; avatar_url?: string }
  state: "open" | "closed"
  created_at: string
  updated_at: string
  comments: number
  html_url: string
  labels: { name: string; color?: string }[]
  draft?: boolean
  mergeable_state?: string
  assignees?: { login: string; avatar_url?: string }[]
  requested_reviewers?: { login: string; avatar_url?: string }[]
  additions?: number
  deletions?: number
  changed_files?: number
}

interface Repo {
  name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  updated_at: string
  open_issues_count: number
  owner: { login: string }
}

export default function RepoPrs() {
  const location = useLocation()
  const { user, isLoading: userLoading } = useUser()
  const repoData = (location.state as { repo: Repo })?.repo

  const owner = repoData?.owner?.login
  const repo = repoData?.name

  const [prs, setPrs] = useState<RawPR[]>([])
  const [stakingMap, setStakingMap] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPR, setSelectedPR] = useState<RawPR | null>(null)

  const [relatedIssue, setRelatedIssue] = useState<any | null>(null)
  const [issueLoading, setIssueLoading] = useState(false)
  const [issueError, setIssueError] = useState<string | null>(null)

  // 1) Load PRs
  useEffect(() => {
    if (userLoading || !user || !owner || !repo) return
    setLoading(true)
    const base = import.meta.env.VITE_API_URL || "http://localhost:8012"
    const jwt = localStorage.getItem("token")
    axios
      .get<{ success: boolean; data: RawPR[] }>(
        `${base}/api/maintainer/repo-pulls?owner=${owner}&repo=${repo}&state=open&per_page=30&page=1`,
        { withCredentials: true, headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined } }
      )
      .then((res) => {
        if (res.data.success) setPrs(res.data.data)
        else setError("Failed to load pull requests")
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false))
  }, [user, userLoading, owner, repo])

  // 2) Fetch DB issue by GitHub global id
  const fetchDbIssue = async (githubId: number) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8012"
    const jwt = localStorage.getItem("token")
    try {
      const res = await axios.get<{ success: boolean; data: any }>(
        `${base}/api/maintainer/issue-by-id?id=${githubId}`,
        { withCredentials: true, headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined } }
      )
      return res.data.success ? res.data.data : null
    } catch (e) {
      console.error("DB fetch error:", (e as any).message)
      return null
    }
  }

  // 3) On Related Issue
  const onFetchIssue = async (pr: RawPR) => {
    const m = pr.body.match(/#(\d+)/)
    if (!m?.[1]) {
      setIssueError("No issue number in PR body")
      return
    }
    setIssueLoading(true)
    setIssueError(null)
    setRelatedIssue(null)

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:8012"
      const jwt = localStorage.getItem("token")

      // a) GitHub proxy to get global id
      const ghRes = await axios.get<{ success: boolean; data: any }>(
        `${base}/api/maintainer/issue-by-number?owner=${owner}&repo=${repo}&number=${m[1]}`,
        { withCredentials: true, headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined } }
      )
      if (!ghRes.data.success) throw new Error("GitHub lookup failed")
      const ghIssue = ghRes.data.data

      // b) DB fetch
      const db = await fetchDbIssue(ghIssue.id)
      if (!db) throw new Error("Ingested issue not found")
      setStakingMap((map) => ({ ...map, [pr.number]: db.stakingRequired }))
      setRelatedIssue(db)
    } catch (e: any) {
      setIssueError(e.message || "Issue fetch failed")
    } finally {
      setIssueLoading(false)
    }
  }

  // Store GitHub username when PR is selected
  const handlePRSelect = (pr: RawPR) => {
    // Store the GitHub username
    const githubUsername = pr.user.login
    console.log(`📝 Storing GitHub username: ${githubUsername}`)
    
    // Update selected state
    setSelectedPR((s) => (s?.number === pr.number ? null : pr))
  }

  const filtered = prs.filter(
    (pr) =>
      pr.title.toLowerCase().includes(searchTerm) ||
      pr.user.login.toLowerCase().includes(searchTerm)
  )

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading PRs…</span>
      </div>
    )
  }
  if (error || !owner || !repo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-600">{error || "Missing repo info"}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {owner}/{repo} Pull Requests
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Input
          placeholder="Search PRs…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="w-64"
        />

        {filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <GitPullRequest className="mx-auto w-12 h-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No open pull requests.</p>
              <Button onClick={() => window.open(`https://github.com/${owner}/${repo}/pulls`, "_blank")}>
                <Plus className="w-4 h-4 mr-2" /> Create PR
              </Button>
            </CardContent>
          </Card>
        )}

        {filtered.map((pr) => (
          <PRCard
            key={pr.number}
            pr={pr}
            staking={stakingMap[pr.number]}
            githubUsername={pr.user.login}
            owner={owner}
            repo={repo}
            isSelected={selectedPR?.number === pr.number}
            onSelect={() => handlePRSelect(pr)}
            onFetchIssue={() => onFetchIssue(pr)}
            onClosePR={() => console.log(`Close PR #${pr.number}`)}
            onMergePR={() => console.log(`Merge PR #${pr.number}`)}
          />
        ))}

        {issueLoading && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <span className="text-blue-800">Fetching related issue…</span>
            </CardContent>
          </Card>
        )}

        {issueError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 font-medium">{issueError}</p>
            </CardContent>
          </Card>
        )}

        {relatedIssue && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Related Issue Found</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-800 hover:text-red-600"
                onClick={() => setRelatedIssue(null)}
              >
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="font-semibold text-green-900">
                #{relatedIssue.number}: {relatedIssue.title}
              </h4>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {relatedIssue.body || "*No description provided.*"}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}