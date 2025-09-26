"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RepositoryList } from "./repository-list"
import { PaginationControls } from "./pagination-controls"
import { Plus, Search } from "lucide-react"

export function RepositoriesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 11

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Repositories</h1>
            <p className="text-sm text-gray-600 mt-1">List of repositories accessible to CodeRabbit.</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Repositories
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Repo not found? Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <RepositoryList searchQuery={searchQuery} />

      <div className="border-t border-gray-200 px-6 py-4">
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}
