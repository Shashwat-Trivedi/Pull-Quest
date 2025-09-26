// src/components/PRCard.tsx
"use client"

import {
  GitPullRequest,
  User,
  Clock,
  MessageSquare,
  ExternalLink,
  FileText,
  GitBranch,
  XCircle,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCalculateXp } from "@/hooks/useCalculateXp"
import MergeFeedbackDialog from "./DialogPRs"
import axios from "axios"

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

interface PRCardProps {
  pr: RawPR
  isSelected: boolean
  staking?: number
  githubUsername: string
  owner: string
  repo: string
  onSelect: () => void
  onFetchIssue: () => void
  onClosePR: () => void
  onMergePR: () => void
}

export default function PRCard({
  pr,
  staking,
  githubUsername,
  owner,
  repo,
  isSelected,
  onSelect,
  onFetchIssue,
  onClosePR,
  onMergePR,
}: PRCardProps) {
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const { calculateXp } = useCalculateXp()

  // inside PRCard.tsx
const handleFeedbackSubmit = async (
    feedback: {
      ratings: Record<string, number>;
      bonuses: Record<string, boolean>;
    }
  ) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8012";
    const jwt  = localStorage.getItem("token");
  
    // helper → turn every “#123” mention into number 123
    const extractLinkedIssues = (body: string): number[] =>
      Array.from(body.matchAll(/#(\d+)/g), m => parseInt(m[1], 10));
  
    try {
      /* ───────── 1. Calculate rewards ───────── */
      const { totalXP } = calculateXp(feedback);
      const coinsAwarded = totalXP * 2;        // 2 coins / XP
  
      /* ───────── 2. Merge the PR (returns the merge commit SHA) ───────── */
      console.log("🔄 Merging PR via GitHub API…");
      const mergeRes = await axios.post(
        `${base}/api/maintainer/merge-pr`,
        {
          owner,
          repo,
          pull_number: pr.number,
          author: pr.user.login,
          staking,
          xp: totalXP,
        },
        {
          withCredentials: true,
          headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined },
        }
      );
  
      // GitHub returns the SHA under the key `sha`
      const mergeSha: string =
        mergeRes.data?.data?.sha || mergeRes.data?.data?.merge_commit_sha;
  
      if (!mergeSha) throw new Error("Could not obtain merge SHA from API");
      console.log("✅ PR merged, SHA =", mergeSha);
  
      /* ───────── 3. Ingest merged-PR record ───────── */
      await axios.post(
        `${base}/api/maintainer/ingest-merged-pr`,
        {
          githubUsername,
          repository: { owner, repo },
  
          // only the fields your schema actually requires
          pr: {
            id:        pr.number * 1_000_000,   // synthetic unique ID
            number:    pr.number,
            title:     pr.title,
            body:      pr.body ?? "",
            state:     "closed",
            html_url:  pr.html_url,
            draft:     pr.draft ?? false,
  
            /* ✅   required merge-sha fields   */
            head:             { sha: mergeSha },
            base:             { sha: mergeSha },
            merge_commit_sha: mergeSha,
  
            merged:     true,
            merged_at:  new Date().toISOString(),
  
            /* minimal user info */
            user: {
              id:    0,
              login: pr.user.login,
              avatar_url: pr.user.avatar_url ?? "",
              html_url:   `https://github.com/${pr.user.login}`,
              type:  "User",
            },
  
            /* optional extras (kept from original) */
            assignees:            pr.assignees ?? [],
            requested_reviewers:  pr.requested_reviewers ?? [],
            labels:               pr.labels ?? [],
            comments:             pr.comments ?? 0,
            additions:            pr.additions ?? 0,
            deletions:            pr.deletions ?? 0,
            changed_files:        pr.changed_files ?? 0,
            created_at:           pr.created_at,
            updated_at:           pr.updated_at,
            closed_at:            new Date().toISOString(),
            merged_by: {
              id:    0,
              login: githubUsername,
              avatar_url: "",
              html_url: `https://github.com/${githubUsername}`,
              type:  "User",
            },
            author_association: "CONTRIBUTOR",
          },
  
          /* reward / quality data */
          stakingRequired: staking ?? 0,
          addedXp:         totalXP,
          coinsAdded:      coinsAwarded,
          reviewsApproved: Object.values(feedback.ratings).filter(v => v >= 4).length,
          reviewsChangesRequested: Object.values(feedback.ratings).filter(v => v <= 2).length,
          ciPassed:        true,
          conflictsResolved: false,
  
          /* ✅  real number[] now  */
          linkedIssues: extractLinkedIssues(pr.body ?? ""),
        },
        {
          withCredentials: true,
          headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined },
        }
      );

      console.log("✅ Ingestion complete");
      await axios.patch(
      `${base}/api/maintainer/users/update-stats`,
        { githubUsername, addedXp: totalXP, addedCoins: coinsAwarded },
        { withCredentials: true, headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined } }
      );
      console.log("✅ User XP & coins updated");
  
      /* ───────── Final summary ───────── */
      console.log(`🎉 Merge complete! PR #${pr.number}`);
      console.log(`👤 Author:  ${githubUsername}`);
      console.log(`💰 Staking: ${staking ?? 0}`);
      console.log(`🏆 XP:      ${totalXP}`);
      console.log(`🪙 Coins:   ${coinsAwarded}`);
    } catch (err: any) {
      console.error("❌ Merge process failed:", err.response?.data?.message || err.message);
    }
  
    setShowMergeDialog(false);
    onMergePR();
  };
  
  const formatDate = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60)
    if (diff < 24) return `${Math.floor(diff)}h ago`
    if (diff < 168) return `${Math.floor(diff / 24)}d ago`
    return new Date(iso).toLocaleDateString()
  }
  return (
    <>
      <Card className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {pr.draft ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                  ) : (
                    <GitPullRequest className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{pr.title}</h3>
                    {pr.draft && (
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div>
                    {staking != null && (
                      <div className="flex items-center space-x-1 text-sm text-yellow-700">
                        <span>💰</span>
                        <span className="font-medium">{staking}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="font-medium text-gray-700">#{pr.number}</span>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{githubUsername}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>opened {formatDate(pr.created_at)}</span>
                    </div>
                    {pr.comments > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{pr.comments} comments</span>
                      </div>
                    )}
                  </div>
                  {pr.body && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">{pr.body}</p>
                  )}
                  {pr.labels && pr.labels.length > 0 && (
                    <div className="flex items-center space-x-2 flex-wrap mb-4">
                      {pr.labels.map((label, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-2 py-1"
                          style={{
                            backgroundColor: label.color ? `#${label.color}20` : undefined,
                            borderColor: label.color ? `#${label.color}40` : undefined,
                            color: label.color ? `#${label.color}` : undefined,
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={onFetchIssue}
                      variant="outline"
                      size="sm"
                      className="text-gray-700 border-gray-200 hover:border-gray-300"
                    >
                      <GitBranch className="w-3 h-3 mr-1" />
                      Related Issue
                    </Button>
                    <Button
                      onClick={onSelect}
                      variant="outline"
                      size="sm"
                      className="text-gray-700 border-gray-200 hover:border-gray-300"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {isSelected ? "Hide Details" : "View Details"}
                    </Button>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">Pull Request Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">State:</span>
                        <span className="ml-2 font-medium text-gray-900">{pr.state}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mergeable:</span>
                        <span className="ml-2 font-medium text-gray-900">{pr.mergeable_state || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(pr.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(pr.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <Button
                        size="sm"
                        onClick={onClosePR}
                        className="bg-[#ff5c5c] hover:bg-[#e04e4e] text-white font-semibold px-4 py-2 rounded-md transition flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Close PR
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowMergeDialog(true)}
                        className="bg-[#34d399] hover:bg-[#10b981] text-white font-semibold px-4 py-2 rounded-md transition flex items-center"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Merge PR
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 ml-6">
              <Button
                onClick={() => window.open(pr.html_url, "_blank")}
                className="bg-gray-900 hover:bg-gray-800 text-white"
                size="sm"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View on GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <MergeFeedbackDialog
        showMergeDialog={showMergeDialog}
        setShowMergeDialog={setShowMergeDialog}
        onMergePR={onMergePR}
        onSubmitFeedback={handleFeedbackSubmit}
      />
    </>
  )
}