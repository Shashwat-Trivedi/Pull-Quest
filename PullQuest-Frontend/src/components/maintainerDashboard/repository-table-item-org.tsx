"use client"

import { useState, useEffect } from "react"
import { RepositoryTableItem } from "@/components/repository-table-item"
import { PaginationControls } from "@/components/pagination-controls"

interface Repo {
  name: string
  description: string
  html_url: string
  language: string
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
  // New prop for closing animation
  isClosing?: boolean
  onCloseComplete?: () => void
}

export function RepositoryCardList({
  repos,
  loading,
  error,
  searchQuery,
  currentPage,
  perPage,
  onPageChange,
  isClosing = false,
  onCloseComplete,
}: RepositoryCardListProps) {
  const [closingItems, setClosingItems] = useState<Set<string>>(new Set())
  const [isAnimating, setIsAnimating] = useState(false)

  // filter + paginate
  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  )
  const totalPages = Math.ceil(filtered.length / perPage)
  const startIndex = (currentPage - 1) * perPage
  const pageItems = filtered.slice(startIndex, startIndex + perPage)

  // Handle closing animation
  useEffect(() => {
    if (isClosing && !isAnimating) {
      setIsAnimating(true)
      setClosingItems(new Set())

      // Stagger the closing animation for each item
      pageItems.forEach((repo, index) => {
        setTimeout(() => {
          setClosingItems((prev) => new Set([...prev, repo.name]))
        }, index * 100) // 100ms delay between each item
      })

      // Call onCloseComplete after all animations finish
      const totalAnimationTime = pageItems.length * 100 + 500 // stagger delay + animation duration
      setTimeout(() => {
        setIsAnimating(false)
        onCloseComplete?.()
      }, totalAnimationTime)
    }
  }, [isClosing, isAnimating, pageItems, onCloseComplete])

  // Reset animation state when not closing
  useEffect(() => {
    if (!isClosing) {
      setClosingItems(new Set())
      setIsAnimating(false)
    }
  }, [isClosing])

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* header row */}
      <div
        className={`px-6 py-3 bg-gray-50 border-b border-gray-200 transition-all duration-500 ${
          isClosing ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 flex-1">Repository</span>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">Actions</span>
        </div>
      </div>

      {/* loading state */}
      {loading && (
        <div className="divide-y divide-gray-100">
          {[...Array(perPage)].map((_, i) => (
            <div
              key={i}
              className={`px-6 py-4 animate-pulse flex items-center justify-between transition-all duration-500 ${
                isClosing ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
              }`}
              style={{
                transitionDelay: isClosing ? `${i * 100}ms` : "0ms",
              }}
            >
              <div className="flex-1 flex items-center space-x-3">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-4" />
            </div>
          ))}
        </div>
      )}

      {/* error state */}
      {!loading && error && (
        <div
          className={`p-6 text-center transition-all duration-500 ${
            isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {/* normal list */}
      {!loading && !error && (
        <>
          <div className="divide-y divide-gray-100">
            {pageItems.length === 0 ? (
              <div
                className={`px-6 py-12 text-center transition-all duration-500 ${
                  isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <p className="text-gray-500">
                  {searchQuery ? "No repositories match your search." : "No repositories found."}
                </p>
              </div>
            ) : (
              pageItems.map((repo, index) => (
                <div
                  key={repo.name}
                  className={`transition-all duration-500 ease-in-out ${
                    closingItems.has(repo.name)
                      ? "opacity-0 translate-x-full scale-95 max-h-0 py-0 overflow-hidden"
                      : "opacity-100 translate-x-0 scale-100 max-h-none"
                  }`}
                  style={{
                    transitionDelay: closingItems.has(repo.name) ? "0ms" : `${index * 50}ms`,
                  }}
                >
                  <RepositoryTableItem
                    name={repo.name}
                    description={repo.description}
                    htmlUrl={repo.html_url}
                    language={repo.language}
                    stars={repo.stargazers_count}
                    lastCommit={repo.updated_at}
                    openIssues={repo.open_issues_count}
                    visibility={repo.visibility ?? "Public"}
                    onClickIssues={() => console.log(`See issues for ${repo.name}`)}
                    onClickPRs={() => console.log(`Review PRs for ${repo.name}`)}
                  />
                </div>
              ))
            )}
          </div>

          {/* pagination */}
          {pageItems.length > 0 && (
            <div
              className={`border-t border-gray-200 px-6 py-4 transition-all duration-500 ${
                isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
              style={{
                transitionDelay: isClosing ? `${pageItems.length * 100 + 200}ms` : "0ms",
              }}
            >
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                perPage={perPage}
                totalItems={filtered.length}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
