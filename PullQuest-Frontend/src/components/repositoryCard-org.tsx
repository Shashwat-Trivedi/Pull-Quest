"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { RepositoryTableItem } from "./repository-table-item"
import { PaginationControls } from "@/components/pagination-controls"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Repo {
  name: string
  description: string
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  open_issues_count: number
  visibility?: "Public" | "Private"
}

interface RepositoryCardListProps {
  repos: Repo[]
  loading: boolean
  error: string | null
  searchQuery: string
  currentPage: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  /** when header checkbox toggles */
  onSelectAll?: (checked: boolean) => void
  /** when a single row checkbox toggles */
  onSelectRow?: (repoName: string, checked: boolean) => void
}

export function RepositoryCardList({
  repos,
  loading,
  error,
  searchQuery,
  currentPage,
  perPage,
  onPageChange,
  onSelectAll,
  onSelectRow,
}: RepositoryCardListProps) {
  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Memoize filtered results to prevent unnecessary recalculations
  const filtered = useMemo(() => {
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
    )
  }, [repos, searchQuery])

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filtered.length / perPage)
    const startIndex = (currentPage - 1) * perPage
    const pageItems = filtered.slice(startIndex, startIndex + perPage)

    return {
      totalPages,
      startIndex,
      pageItems,
    }
  }, [filtered, currentPage, perPage])

  // Memoize current page item names to use in dependency array
  const currentPageItemNames = useMemo(() => {
    return paginationData.pageItems.map((item) => item.name)
  }, [paginationData.pageItems])

  // Handle selectAll changes - only update when selectAll or current page items change
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(new Set(currentPageItemNames))
      onSelectAll?.(true)
    } else {
      // Only clear selections for current page items, keep others
      setSelectedRows((prev) => {
        const newSet = new Set(prev)
        currentPageItemNames.forEach((name) => newSet.delete(name))
        return newSet
      })
      onSelectAll?.(false)
    }
  }, [selectAll, currentPageItemNames, onSelectAll])

  // Reset selectAll when page changes if not all items on new page are selected
  useEffect(() => {
    const allCurrentPageSelected = currentPageItemNames.every((name) => selectedRows.has(name))

    if (selectAll && !allCurrentPageSelected && currentPageItemNames.length > 0) {
      setSelectAll(false)
    } else if (!selectAll && allCurrentPageSelected && currentPageItemNames.length > 0) {
      setSelectAll(true)
    }
  }, [currentPageItemNames, selectedRows, selectAll])

  // Memoize handlers to prevent unnecessary re-renders
  const handleSelectAllChange = useCallback((checked: boolean) => {
    setSelectAll(checked)
  }, [])

  const handleSelectRowChange = useCallback(
    (name: string) => (checked: boolean) => {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        if (checked) {
          next.add(name)
        } else {
          next.delete(name)
        }
        return next
      })
      onSelectRow?.(name, checked)
    },
    [onSelectRow],
  )

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(perPage)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header with selection info */}
      <Card className="border-l-4 border-l-blue-500">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAllChange} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Repositories</h3>
                <p className="text-sm text-gray-600">
                  {selectedRows.size > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {selectedRows.size} selected of {filtered.length} repositories
                    </span>
                  ) : (
                    `${filtered.length} repositories found`
                  )}
                </p>
              </div>
            </div>
            {selectedRows.size > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedRows.size} selected
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && <LoadingSkeleton />}

      {/* Error state */}
      {!loading && error && (
        <Card className="border-l-4 border-l-red-500">
          <div className="p-6 text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-1">Error Loading Repositories</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {/* Repository list */}
      {!loading && !error && (
        <>
          {paginationData.pageItems.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? `No repositories match "${searchQuery}". Try adjusting your search terms.`
                    : "This organization doesn't have any repositories yet."}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginationData.pageItems.map((repo) => (
                <Card
                  key={repo.name}
                  className={`transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
                    selectedRows.has(repo.name) ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50/30" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="pt-1">
                        <Checkbox
                          checked={selectedRows.has(repo.name)}
                          onCheckedChange={handleSelectRowChange(repo.name)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <RepositoryTableItem
                          name={repo.name}
                          description={repo.description}
                          htmlUrl={repo.html_url}
                          language={repo.language ?? "Unknown"}
                          stars={repo.stargazers_count}
                          lastCommit={repo.updated_at}
                          openIssues={repo.open_issues_count}
                          visibility={repo.visibility ?? "Public"}
                          onClickIssues={() => console.log(`See issues for ${repo.name}`)}
                          onClickPRs={() => console.log(`Review PRs for ${repo.name}`)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {paginationData.pageItems.length > 0 && (
            <Card>
              <div className="px-6 py-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={paginationData.totalPages}
                  onPageChange={onPageChange}
                  perPage={perPage}
                  totalItems={filtered.length}
                />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
