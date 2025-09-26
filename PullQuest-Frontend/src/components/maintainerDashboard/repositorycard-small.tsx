// src/components/RepositoryCardList.tsx
"use client";

import { RepositoryTableItem } from "@/components/repository-table-item";
import { PaginationControls } from "@/components/pagination-controls";

interface Repo {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
  open_issues_count: number;
  visibility?: "Public" | "Private";
}

// src/components/RepositoryCardList.tsx
export interface RepositoryCardListProps {
  repos: Repo[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;

  // new:
  isClosing: boolean;
  onCloseComplete: () => void;
}


export function RepositoryCardList({
  repos,
  loading,
  error,
  searchQuery,
  currentPage,
  perPage,
  onPageChange,
}: RepositoryCardListProps) {
  // filter + paginate
  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(startIndex, startIndex + perPage);

  // outer card wrapper
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* header row */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 flex-1">Repository</span>
          <span className="text-sm font-medium text-gray-700 w-20 text-center">Actions</span>
        </div>
      </div>

      {/* loading state */}
      {loading && (
        <div className="divide-y divide-gray-100">
          {[...Array(perPage)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse flex items-center justify-between">
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
        <div className="p-6 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {/* normal list */}
      {!loading && !error && (
        <>
          <div className="divide-y divide-gray-100">
            {pageItems.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No repositories match your search."
                    : "No repositories found."}
                </p>
              </div>
            ) : (
              pageItems.map((repo) => (
                <RepositoryTableItem
                  key={repo.name}
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
              ))
            )}
          </div>

          {/* pagination */}
          {pageItems.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                perPage={perPage}
                // onPerPageChange={onPageChange => onPageChange(onPageChange)}
                totalItems={filtered.length}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
