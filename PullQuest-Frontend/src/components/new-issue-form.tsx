"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, Plus, Tag, Users, Target, AlertCircle, ArrowLeft, FileText } from "lucide-react"

interface CreateResp {
  success: boolean
  number?: number
  message?: string
}

/* --- optional preset labels (remove / change as you like) --- */
const PRESET_LABELS = [
  { name: "bug", color: "bg-red-100 text-red-800 border-red-200" },
  { name: "enhancement", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "question", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { name: "documentation", color: "bg-green-100 text-green-800 border-green-200" },
  { name: "good first issue", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
]

export default function NewIssueForm() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const navigate = useNavigate()

  /* --------------- form state --------------- */
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [assignees, setAssignees] = useState<string>("")
  const [milestone, setMilestone] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!owner || !repo) return <p className="text-red-500">Missing URL params.</p>

  /* --------------- helpers --------------- */
  const toggleLabel = (l: string) =>
    setLabels((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]))

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Title is required")
    setSubmitting(true)
    setError(null)

    const url = `${import.meta.env.VITE_API_URL || "http://localhost:8012"}/api/maintainer/create-issue`

    const jwt = localStorage.getItem("token")
    const cfg = {
      withCredentials: true,
      headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined },
    }

    const payload = {
      owner,
      repo,
      title,
      body,
      labels,
      assignees: assignees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      milestone: milestone || undefined,
    }

    try {
      const res = await axios.post<CreateResp>(url, payload, cfg)
      if (res.data.success) {
        navigate(`/maintainer/repo/${owner}/${repo}/issues`)
      } else setError(res.data.message || "Issue creation failed")
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Unknown error")
    } finally {
      setSubmitting(false)
    }
  }

  /* --------------- UI --------------- */
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Github className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Issue</h1>
            <p className="text-gray-600">
              {owner}/{repo}
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
        <CardContent className="p-8">
          {/* Main Form Section */}
          <div className="space-y-8">
            {/* Title and Description */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Issue Title</label>
                </div>
                <Input
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  className="text-lg font-medium border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  placeholder="Provide a detailed description of the issue, including steps to reproduce, expected behavior, and any relevant context..."
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={submitting}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Labels Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PRESET_LABELS.map(({ name, color }) => (
                    <Badge
                      key={name}
                      onClick={() => toggleLabel(name)}
                      className={`cursor-pointer border transition-all duration-200 hover:scale-105 ${
                        labels.includes(name)
                          ? color + " shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
                {labels.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Selected labels:</strong> {labels.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Assignees</label>
                  </div>
                  <Input
                    placeholder="username1, username2, ..."
                    value={assignees}
                    onChange={(e) => setAssignees(e.target.value)}
                    disabled={submitting}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">Comma-separated list of GitHub usernames</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Milestone</label>
                  </div>
                  <Input
                    placeholder="v1.0.0 or milestone title"
                    value={milestone}
                    onChange={(e) => setMilestone(e.target.value)}
                    disabled={submitting}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">Optional milestone for this issue</p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Issues help track bugs, feature requests, and other tasks</div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !title.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Issue
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
