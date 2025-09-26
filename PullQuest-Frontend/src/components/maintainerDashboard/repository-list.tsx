"use client"

import { RepositoryItem } from "./repository-item"

interface Repository {
  id: string
  name: string
  visibility: "Public" | "Private"
  description?: string
}

const repositories: Repository[] = [
  { id: "1", name: "website1", visibility: "Public" },
  { id: "2", name: "graphica", visibility: "Public" },
  { id: "3", name: "OAC-website", visibility: "Public" },
  { id: "4", name: "test", visibility: "Public" },
  { id: "5", name: "JSProjects", visibility: "Public" },
  { id: "6", name: "AIT-Cycling-Club", visibility: "Public" },
  { id: "7", name: "Restro-Website", visibility: "Public" },
  { id: "8", name: "testing", visibility: "Public" },
  { id: "9", name: "AIT-Cycling-Club-website", visibility: "Public" },
  { id: "10", name: "JavaScript-Tutorial", visibility: "Public" },
]

interface RepositoryListProps {
  searchQuery: string
}

export function RepositoryList({ searchQuery }: RepositoryListProps) {
  const filteredRepositories = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="divide-y divide-gray-100">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 flex-1">Repository</span>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">Actions</span>
        </div>
      </div>

      {filteredRepositories.map((repository) => (
        <RepositoryItem key={repository.id} repository={repository} />
      ))}

      {filteredRepositories.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No repositories found matching your search.</p>
        </div>
      )}
    </div>
  )
}
