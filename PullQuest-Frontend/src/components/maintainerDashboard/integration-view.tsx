"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Settings, Lock } from "lucide-react"

const integrations = [
  {
    id: "1",
    name: "GitHub",
    description: "Connect your GitHub repositories for automated code reviews",
    icon: "🐙",
    status: "connected",
    category: "Version Control",
    isLocked: false,
  },
  {
    id: "2",
    name: "GitLab",
    description: "Integrate with GitLab for comprehensive code analysis",
    icon: "🦊",
    status: "available",
    category: "Version Control",
    isLocked: true,
  },
  {
    id: "3",
    name: "Slack",
    description: "Get notifications and updates directly in your Slack channels",
    icon: "💬",
    status: "available",
    category: "Communication",
    isLocked: true,
  },
  {
    id: "4",
    name: "Discord",
    description: "Receive code review notifications in your Discord server",
    icon: "🎮",
    status: "available",
    category: "Communication",
    isLocked: true,
  },
  {
    id: "5",
    name: "Jira",
    description: "Link pull requests with Jira issues automatically",
    icon: "📋",
    status: "available",
    category: "Project Management",
    isLocked: true,
  },
  {
    id: "6",
    name: "Linear",
    description: "Connect Linear issues with your code reviews",
    icon: "📈",
    status: "available",
    category: "Project Management",
    isLocked: true,
  },
]

export function IntegrationsView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-600 mt-1">Connect your favorite tools and services with CodeRabbit.</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled>
            <Lock className="w-4 h-4 mr-2" />
            Premium Feature
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="relative hover:shadow-md transition-shadow">
              {integration.isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge
                      variant={integration.status === "connected" ? "default" : "secondary"}
                      className={integration.status === "connected" ? "bg-green-100 text-green-800" : ""}
                    >
                      {integration.status === "connected" ? "Connected" : "Available"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 mb-4">{integration.description}</CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{integration.category}</span>
                  <Button
                    variant={integration.status === "connected" ? "outline" : "default"}
                    size="sm"
                    disabled={integration.isLocked}
                    className={integration.isLocked ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {integration.status === "connected" ? (
                      <>
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No integrations found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
