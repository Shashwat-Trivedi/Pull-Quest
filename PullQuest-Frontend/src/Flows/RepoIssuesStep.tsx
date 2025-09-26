"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "../context/UserProvider"
import axios from "axios"
import IssueCard from "@/components/IssueCard"
import { Github, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RawIssue {
  number: number
  title: string
  body: string
  user: { login: string }
  state: "open" | "closed"
  created_at: string
  updated_at: string
  comments: number
  labels: { name: string; color?: string }[]
  html_url: string
  pull_request?: object
}

export default function RepoIssuesStep() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const { user, isLoading: userLoading } = useUser()
  const navigate = useNavigate()

  const [issues, setIssues] = useState<RawIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ------------ fetch open issues (skip PRs) ------------ */
  useEffect(() => {
    if (userLoading) return
    if (!user || !owner || !repo) {
      setError("Missing owner/repo information")
      return
    }

    setLoading(true)
    const url = `${
      import.meta.env.VITE_API_URL || "http://localhost:8012"
    }/api/maintainer/repo-issues?owner=${owner}&repo=${repo}&state=open&per_page=30&page=1`

    const jwt = localStorage.getItem("token")
    const cfg = { withCredentials: true, headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined } }

    axios
      .get<{ success: boolean; data: RawIssue[] }>(url, cfg)
      .then(res =>
        res.data.success
          ? setIssues(res.data.data.filter(i => !i.pull_request))
          : setError("Failed to load issues")
      )
      .catch(err =>
        setError(err.response?.data?.message || err.message || "Unknown error")
      )
      .finally(() => setLoading(false))
  }, [user, userLoading, owner, repo])

  /* ---------------- UI ---------------- */
  if (userLoading || loading) return <p className="text-center text-gray-500">Loading issues…</p>
  if (error) return <p className="text-center text-red-500">Error: {error}</p>
  if (!owner || !repo) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* heading + new-issue button */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Issues for {owner}/{repo}
        </h1>
        <Button
          onClick={() => navigate(`/maintainer/repo/${owner}/${repo}/issues/new`)}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>New&nbsp;Issue</span>
        </Button>
      </div>

      {/* info card */}
      <Card className="border">
        <CardContent className="p-8 text-center">
          <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Repository Issues</h3>
          <p className="text-gray-600">Live data from GitHub via your backend.</p>
        </CardContent>
      </Card>

      {/* list */}
      <div className="space-y-3">
        {issues.length ? (
          issues.map(i => (
            <IssueCard
              key={i.number}
              number={i.number}
              title={i.title}
              body={i.body}
              author={i.user.login}
              state={i.state}
              createdAt={new Date(i.created_at).toLocaleString()}
              updatedAt={new Date(i.updated_at).toLocaleString()}
              comments={i.comments}
              labels={i.labels}
              htmlUrl={i.html_url}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No open issues for this repository.</p>
        )}
      </div>
    </div>
  )
}
