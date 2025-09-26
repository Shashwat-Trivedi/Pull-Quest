"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface Repository {
  id: string
  name: string
  visibility: "Public" | "Private"
  description?: string
}

interface RepositoryItemProps {
  repository: Repository
}

export function RepositoryItem({ repository }: RepositoryItemProps) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{repository.name}</h3>
              <Badge
                variant={repository.visibility === "Public" ? "secondary" : "outline"}
                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {repository.visibility}
              </Badge>
            </div>
            {repository.description && <p className="text-sm text-gray-600 mt-1">{repository.description}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
