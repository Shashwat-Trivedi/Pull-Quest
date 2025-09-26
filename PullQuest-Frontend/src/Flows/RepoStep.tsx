// src/Flows/RepoStep.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserProvider";
import { RepositoryCardList } from "../components/maintainerDashboard/repositorycard-small";

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

export default function RepoStep() {
  const { user, isLoading: userLoading } = useUser();
  const githubUsername = user?.githubUsername ?? "";

  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    if (userLoading) return;
    if (!githubUsername) {
      setError("No GitHub username available in context");
      return;
    }
    setLoading(true);
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:8012"}` +
                `/api/maintainer/repos-by-username?githubUsername=${encodeURIComponent(githubUsername)}` +
                `&per_page=100&page=1`;
    const token = localStorage.getItem("token");

    axios
      .get<{ success: boolean; data: Repo[] }>(url, {
        withCredentials: true,
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      })
      .then((res) => {
        if (res.data.success) setRepos(
          res.data.data.map((r) => ({
            ...r,
            visibility: r.visibility ?? "Public",
          }))
        );
        else setError("Failed to load repositories");
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, [githubUsername, userLoading]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-center">Repository Dashboard</h1>
      <div className="max-w-5xl mx-auto flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
      </div>
      <RepositoryCardList
        repos={repos}
        loading={userLoading || loading}
        error={error}
        searchQuery={searchQuery}
        currentPage={currentPage}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setCurrentPage(1);
        }}
        isClosing={false}
        onCloseComplete={() => console.log("Close complete")}
      />
    </div>
  );
}
