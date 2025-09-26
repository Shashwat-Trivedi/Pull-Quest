// src/components/OrgSettingsView.tsx
"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";          // 🆕 for “Go to docs”
import { OrgGeneralSettings } from "./OrgGeneralSettings";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Eye, EyeOff, Key, Copy, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserProvider";

interface ApiKey {
  _id: string;
  name?: string;
  secretKey: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

export function OrgSettingsView() {
  /* ── auth context ───────────────────────────────────────── */
  const { user }  = useUser();
  const token      = user?.accessToken;
  const maintainer = user?.githubUsername;
  const role       = user?.role;

  /* ── org input state (persist in localStorage) ──────────── */
  const [orgLogin, setOrgLogin] = useState<string>(
    () => localStorage.getItem("lastOrgLogin") || ""
  );

  /* ── API-key data ───────────────────────────────────────── */
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* 👁️ track which keys are revealed */
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const toggleKeyVisibility = (id: string) =>
    setVisibleKeys((v) => ({ ...v, [id]: !v[id] }));

  /* ── fetch helper ───────────────────────────────────────── */
  const fetchKeys = async () => {
    if (!orgLogin || !token || !maintainer || !role) return;

    setLoading(true);
    setError(null);

    const qs = new URLSearchParams({
      orgName:            orgLogin,
      maintainerUsername: maintainer,
      role,
    }).toString();

    const url =
      `${import.meta.env.VITE_API_URL || "http://localhost:8012"}` +
      `/api/maintainer/api-keys?${qs}`;

    try {
      const res  = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      if (!res.ok || !body.success)
        throw new Error(body.message || `HTTP ${res.status}`);

      setApiKeys(body.data as ApiKey[]);
      localStorage.setItem("lastOrgLogin", orgLogin);
      setVisibleKeys({});            // reset visibility map
    } catch (err: any) {
      setError(err.message ?? "Failed to load API keys");
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  /* auto-fetch when deps change */
  useEffect(() => {
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgLogin, token, maintainer, role]);

  /* ── helpers ────────────────────────────────────────────── */
  const maskKey = (key: string) =>
    key.length <= 8 ? "••••••" : `${key.slice(0, 4)}••••••••${key.slice(-4)}`;

  const copyKey = (key: string) => navigator.clipboard.writeText(key);

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* ───────── Header (title + Docs button) ───────── */}
      <div className="border-b border-gray-200 p-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Organization Settings</h1>

        {/* “Go to docs” button */}
        <Button asChild variant="outline" size="sm" title="Open documentation">
          <Link to="/maintainer/docs" className="inline-flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Docs</span>
          </Link>
        </Button>
      </div>

      {/* ───────── Tab content ───────── */}
      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* General tab */}
          <TabsContent value="general">
            <OrgGeneralSettings />
          </TabsContent>

          {/* API Keys tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-6 md:grid-cols-[280px_1fr]">
                {/* left column – choose org */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-login-input">Organization login</Label>
                    <Input
                      id="org-login-input"
                      placeholder="my-org"
                      value={orgLogin}
                      onChange={(e) => setOrgLogin(e.target.value.trim())}
                      onKeyDown={(e) => e.key === "Enter" && fetchKeys()}
                    />
                  </div>

                  <Button onClick={fetchKeys} disabled={loading || !orgLogin}>
                    {loading ? "Loading…" : "Load keys"}
                  </Button>

                  {error && (
                    <p className="text-sm mt-2 text-red-600 whitespace-pre-wrap">
                      {error}
                    </p>
                  )}
                </div>

                {/* right column – list keys */}
                <div className="space-y-4">
                  {loading && (
                    <p className="text-sm text-gray-500">Fetching keys…</p>
                  )}

                  {!loading && apiKeys.length === 0 && !error && (
                    <p className="text-sm text-gray-500">
                      No keys for this org.
                    </p>
                  )}

                  {apiKeys.map((k) => {
                    const isVisible = !!visibleKeys[k._id];
                    const display = isVisible ? k.secretKey : maskKey(k.secretKey);

                    return (
                      <div
                        key={k._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Key className="w-4 h-4 text-gray-600" />
                            <p className="font-medium text-gray-900">
                              {k.name ?? "Untitled key"}
                            </p>
                          </div>

                          {/* eye toggle + key value */}
                          <div className="flex items-center space-x-2 mb-1">
                            <button
                              type="button"
                              title={isVisible ? "Hide key" : "Show key"}
                              className="text-gray-600 hover:text-gray-900 focus:outline-none"
                              onClick={() => toggleKeyVisibility(k._id)}
                            >
                              {isVisible ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>

                            <span className="text-sm font-mono text-gray-600 break-all">
                              {display}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              Created:&nbsp;
                              {new Date(k.createdAt).toLocaleDateString()}
                            </span>
                            {k.lastUsed && (
                              <span>Last used: {k.lastUsed}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Copy key"
                            onClick={() => copyKey(k.secretKey)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled /* delete not wired yet */
                            title="Delete key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security tab – placeholder */}
          <TabsContent value="security">
            {/* security & danger-zone settings */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
