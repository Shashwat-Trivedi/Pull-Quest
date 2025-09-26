// src/components/OrgCard.tsx

import { Button } from "@/components/ui/button"
import { Settings, ChevronRight, GitBranch, Users } from "lucide-react"

export interface OrgCardProps {
  login: string
  description?: string
  avatarUrl: string
  htmlUrl: string
  membershipText?: string
  repoCount?: number
  members?: number
  onClick: () => void;
}

export function OrgCard({
  login,
  description,
  avatarUrl,
  htmlUrl,
  membershipText = "Member",
  repoCount,
  members,
  onClick,
}: OrgCardProps) {
  return (
    <div  onClick={onClick} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
      <div className="flex items-center space-x-4">
        <img
          src={avatarUrl}
          alt={`${login} avatar`}
          className="h-12 w-12 rounded-full border border-gray-200"
        />
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{login}</h3>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{membershipText}</span>
          </div>
          {description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {repoCount != null && (
              <div className="flex items-center space-x-1">
                <GitBranch className="w-4 h-4" />
                <span>{repoCount} repos</span>
              </div>
            )}
            {members != null && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{members} members</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={(e) => {
            e.stopPropagation()
            window.open(`${htmlUrl}/settings`, "_blank")
          }}
        >
          <Settings className="w-4 h-4 mr-1" />Settings
        </Button>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
