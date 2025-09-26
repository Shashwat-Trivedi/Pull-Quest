"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RepositoryCardList } from "./repositorycard-small"

export interface RepositoryCardListProps {
    repos: Array<{
      name: string
      description: string
      html_url: string
      language: string
      stargazers_count: number
      updated_at: string
      open_issues_count: number
      visibility: "Public" | "Private"
    }>
    loading: boolean
    error: string | null
    searchQuery: string
    currentPage: number
    perPage: number
    onPageChange: (page: number) => void
    onPerPageChange: (perPage: number) => void
    isClosing: boolean // Added isClosing property
  }
// Mock data for demonstration
const mockRepos = [
  {
    name: "awesome-project",
    description: "A really awesome project that does amazing things",
    html_url: "https://github.com/user/awesome-project",
    language: "TypeScript",
    stargazers_count: 1234,
    updated_at: "2024-01-15T10:30:00Z",
    open_issues_count: 5,
    visibility: "Public" as const,
  },
  {
    name: "secret-sauce",
    description: "The secret sauce behind our success",
    html_url: "https://github.com/user/secret-sauce",
    language: "JavaScript",
    stargazers_count: 567,
    updated_at: "2024-01-14T15:45:00Z",
    open_issues_count: 12,
    visibility: "Private" as const,
  },
  {
    name: "data-processor",
    description: "High-performance data processing pipeline",
    html_url: "https://github.com/user/data-processor",
    language: "Python",
    stargazers_count: 890,
    updated_at: "2024-01-13T09:20:00Z",
    open_issues_count: 3,
    visibility: "Public" as const,
  },
]

export function RepositoryManagerWithAnimation() {
  const [repos] = useState(mockRepos)
  const [isClosing, setIsClosing] = useState(false)
  const [searchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isVisible, setIsVisible] = useState(true)

  const handleCloseAnimation = () => {
    setIsClosing(true)
  }

  const handleCloseComplete = () => {
    // This is called when the closing animation completes
    setIsVisible(false)
    console.log("All repositories have been closed!")

    // Optional: Reset after a delay to show them again
    setTimeout(() => {
      setIsVisible(true)
      setIsClosing(false)
    }, 2000)
  }

  const handleReset = () => {
    setIsVisible(true)
    setIsClosing(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Animation Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={handleCloseAnimation} disabled={isClosing || !isVisible} variant="destructive">
              {isClosing ? "Closing..." : "Close All Repositories"}
            </Button>
            <Button onClick={handleReset} disabled={isVisible && !isClosing} variant="outline">
              Reset
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>Click "Close All Repositories" to see the staggered closing animation.</p>
            <p>The repositories will automatically reappear after 2 seconds.</p>
          </div>
        </CardContent>
      </Card>

      {isVisible && (
        <RepositoryCardList
          repos={repos}
          loading={false}
          error={null}
          searchQuery={searchQuery}
          currentPage={currentPage}
          perPage={10}
          onPageChange={setCurrentPage}
          onPerPageChange={() => {}}
          isClosing={isClosing}
          onCloseComplete={handleCloseComplete}
        />
      )}

      {!isVisible && (
        <Card className="border-dashed border-2 border-gray-300">
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All repositories closed</h3>
            <p className="text-gray-600">The repositories will reappear automatically...</p>
          </div>
        </Card>
      )}
    </div>
  )
}
