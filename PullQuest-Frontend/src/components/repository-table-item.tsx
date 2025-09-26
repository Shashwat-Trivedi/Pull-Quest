"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface RepositoryTableItemProps {
  name: string
  description: string
  htmlUrl: string
  language: string
  stars: number
  lastCommit: string
  openIssues: number
  visibility: "Public" | "Private"
  onClickIssues?: () => void
  onClickPRs?: () => void
}

export function RepositoryTableItem({ name, visibility }: RepositoryTableItemProps) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">{name}</h3>
            <Badge
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 font-normal"
            >
              {visibility}
            </Badge>
          </div>
        </div>

        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
