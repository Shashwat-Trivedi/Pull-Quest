"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/context/UserProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RepositoryCardList } from "../repositoryCard-org";
import { customAlphabet } from "nanoid";

// nanoid setup for 20-char alphanumeric slug
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const makeSlug = customAlphabet(ALPHABET, 20);

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  open_issues_count: number;
  private?: boolean;
  visibility?: "Public" | "Private";
}

export function OrgGeneralSettings() {
  const { user } = useUser();
  const token = user?.accessToken;
  const defaultUser = user?.githubUsername ?? "";
  const role = user?.role;
  // --- form & fetch state ---
  const [githubUsername, setGithubUsername] = useState(defaultUser);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- selection & pagination ---
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // --- context state & editing ---
  const [isClosing, setIsClosing] = useState(false);
  const [ctxLoading, setCtxLoading] = useState(false);
  const [ctxError, setCtxError] = useState<string | null>(null);
  const [generatedCtx, setGeneratedCtx] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCtx, setEditedCtx] = useState<string>("");

  // local save state
  const [savedCtxLocal, setSavedCtxLocal] = useState(false);
  const handleSaveContextLocal = () => {
    setSavedCtxLocal(true);
  };

  // API key display state
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Sync editedCtx when generatedCtx changes
  useEffect(() => {
    setEditedCtx(generatedCtx);
  }, [generatedCtx]);

  // Sync username input
  useEffect(() => {
    if (defaultUser) setGithubUsername(defaultUser);
  }, [defaultUser]);

  // Fetch repos from backend
  const fetchRepos = async () => {
    if (!githubUsername) {
      setError("Please enter a GitHub username or org");
      return;
    }
    if (!token) {
      setError("No auth token available – please log in again");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8012"}` +
          `/api/maintainer/orgs-by-username?githubUsername=${encodeURIComponent(
            githubUsername
          )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || `HTTP ${res.status}`);
      const normalized: Repo[] = body.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        language: r.language ?? "Unknown",
        stargazers_count: r.stargazers_count,
        updated_at: r.updated_at,
        open_issues_count: r.open_issues_count,
        private: r.private,
        visibility: r.private ? "Private" : "Public",
      }));
      setRepos(normalized);
      setSelectedLinks([]);
      setCurrentPage(1);
      setSearchQuery("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedLinks(checked ? repos.map((r) => r.html_url) : []);
  }, [repos]);

  const handleSelectRow = useCallback((name: string, checked: boolean) => {
    const repo = repos.find((r) => r.name === name);
    if (!repo) return;
    setSelectedLinks((prev) =>
      checked ? Array.from(new Set([...prev, repo.html_url])) : prev.filter((u) => u !== repo.html_url)
    );
  }, [repos]);

  // Pagination handlers
  const handlePageChange = useCallback((p: number) => setCurrentPage(p), []);
  const handlePerPageChange = useCallback((n: number) => {
    setPerPage(n);
    setCurrentPage(1);
  }, []);

  // Generate context
  const handleGenerate = async () => {
    setCtxError(null);
    setCtxLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8012"}/api/LLM/generate-context`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ repos: selectedLinks }),
        }
      );
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || `HTTP ${res.status}`);
      setGeneratedCtx(body.data);
      setIsClosing(true);
    } catch (err: any) {
      setCtxError(err.message);
      setIsClosing(false);
    } finally {
      setCtxLoading(false);
    }
  };

// Generate & POST API Key
const handleGenerateApiKey = async () => {
  if (!generatedCtx) {
    setError("You need to generate context first.");
    return;
  }

  const prefix     = githubUsername.slice(0, 19);
  const randomPart = makeSlug().slice(0, 20 - prefix.length);
  const secretKey  = `${prefix}${randomPart}`;

  const payload = {
    secretKey,
    context:            generatedCtx,
    orgName:            githubUsername,   // org you’re saving
    repoLinks:          selectedLinks,
    role,                                // e.g. "maintainer"
    maintainerUsername: user?.githubUsername,
    // maintainerUserId:   user?._id,
  };

  /* 👇 LOG everything being sent */
  console.log("📤 Sending API-key payload:", payload);

  try {
    const res  = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8012"}/api/maintainer/api-key`,
      {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const body = await res.json();
    if (!body.success) throw new Error(body.message);
    setApiKey(body.data.secretKey);
  } catch (err: any) {
    setError(err.message);
  }
};


  return (
    <div className="space-y-8">
      {/* 1️⃣ Fetch UI */}
      <Card>
        <CardHeader>
          <CardTitle>Fetch Your GitHub Repositories</CardTitle>
          <CardDescription>Fetch repos using your GitHub username/org.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="github-username">GitHub Username or Org</Label>
              <Input id="github-username" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} />
            </div>
            <Button onClick={fetchRepos} disabled={loading}>{loading ? "Loading…" : "Fetch Repos"}</Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {/* 2️⃣ Search UI */}
      {repos.length > 0 && !isClosing && (
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="search-repos">Search Repositories</Label>
            <Input id="search-repos" placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mt-2" />
          </CardContent>
        </Card>
      )}

      {/* 3️⃣ Repo list */}
      {repos.length > 0 && !isClosing && (
        <RepositoryCardList
          repos={repos}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          currentPage={currentPage}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
        />
      )}

      {/* 4️⃣ Generate context */}
      {selectedLinks.length > 0 && !isClosing && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Context</CardTitle>
            <CardDescription>Send selected repos to backend to build your context.</CardDescription>
          </CardHeader>
          <CardContent className="text-right space-y-2">
            {ctxError && <p className="text-sm text-red-600">{ctxError}</p>}
            <Button onClick={handleGenerate} disabled={ctxLoading}>
              {ctxLoading ? "Generating…" : "Generate context of repos"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 5️⃣ Repository Context with Edit/Save */}
      {generatedCtx && !savedCtxLocal && (
        <Card>
          <CardHeader>
            <CardTitle>Repository Context</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {isEditing ? (
              <>
                <Textarea rows={8} value={editedCtx} onChange={(e) => setEditedCtx(e.target.value)} className="w-full border-gray-300" />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button variant="outline" onClick={() => { setEditedCtx(generatedCtx); setIsEditing(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={() => { setGeneratedCtx(editedCtx); setIsEditing(false); }}>
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <ReactMarkdown>{generatedCtx}</ReactMarkdown>
                <div className="text-right mt-2">
                  <Button variant="outline" onClick={() => { setEditedCtx(generatedCtx); setIsEditing(true); }}>
                    Edit
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 6️⃣ Save Context */}
      {generatedCtx && !savedCtxLocal && (
        <Card>
          <CardHeader>
            <CardTitle>Save Context</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <Button onClick={handleSaveContextLocal}>Save Context</Button>
          </CardContent>
        </Card>
      )}

      {/* 7️⃣ Create & display API Key */}
      {savedCtxLocal && (
        <Card>
          <CardHeader>
            <CardTitle>Create API Key</CardTitle>
            <CardDescription>Save your org’s key and context to the server.</CardDescription>
          </CardHeader>
          <CardContent className="text-right space-y-2">
            <Button onClick={handleGenerateApiKey}>Create API Key</Button>
            {apiKey && (
              <p className="mt-2 text-sm break-all">🔑 <strong>{apiKey}</strong></p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8️⃣ Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Your organization preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Auto-review new repositories</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Email notifications</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Weekly reports</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
