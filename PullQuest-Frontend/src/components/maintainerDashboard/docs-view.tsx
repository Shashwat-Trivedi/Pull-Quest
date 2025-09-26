"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ExternalLink,
  Copy,
  CodeIcon,
  FileText,
  Video,
  Zap,
  BookOpen,
  Settings,
  Users,
  Shield,
  Rocket,
  CheckCircle,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react"

/**********************************************************
 *  Documentation data
 *********************************************************/
const docSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Set up PullQuest in minutes",
    icon: Rocket,
    badge: "Essential",
    badgeColor: "bg-green-100 text-green-800",
    items: [
      { title: "Quick Setup Guide", time: "5 min", type: "guide" },
      { title: "Installation", time: "3 min", type: "guide" },
      { title: "First Repository", time: "10 min", type: "tutorial" },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    description: "Customize PullQuest for your workflow",
    icon: Settings,
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-800",
    items: [
      { title: "GitHub Actions Setup", time: "8 min", type: "guide" },
      { title: "Webhook Configuration", time: "5 min", type: "guide" },
      { title: "Custom Templates", time: "12 min", type: "tutorial" },
    ],
  },
  {
    id: "team-management",
    title: "Team Management",
    description: "Manage users and permissions",
    icon: Users,
    badge: "Pro",
    badgeColor: "bg-purple-100 text-purple-800",
    items: [
      { title: "User Roles", time: "6 min", type: "guide" },
      { title: "Team Invitations", time: "4 min", type: "guide" },
      { title: "Access Control", time: "10 min", type: "tutorial" },
    ],
  },
  {
    id: "security",
    title: "Security",
    description: "Keep your repositories secure",
    icon: Shield,
    badge: "Important",
    badgeColor: "bg-red-100 text-red-800",
    items: [
      { title: "API Keys", time: "5 min", type: "guide" },
      { title: "Permissions", time: "7 min", type: "guide" },
      { title: "Audit Logs", time: "8 min", type: "tutorial" },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Features",
    description: "Power user features and integrations",
    icon: Zap,
    badge: "Advanced",
    badgeColor: "bg-orange-100 text-orange-800",
    items: [
      { title: "Custom Integrations", time: "15 min", type: "tutorial" },
      { title: "API Reference", time: "20 min", type: "reference" },
      { title: "Webhooks", time: "12 min", type: "guide" },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and solutions",
    icon: BookOpen,
    badge: "Help",
    badgeColor: "bg-gray-100 text-gray-800",
    items: [
      { title: "Common Issues", time: "10 min", type: "guide" },
      { title: "Debug Mode", time: "6 min", type: "guide" },
      { title: "Support", time: "3 min", type: "reference" },
    ],
  },
]

const quickLinks = [
  {
    title: "Video Tutorials",
    description: "Watch step-by-step guides",
    icon: Video,
    href: "#",
    color: "text-red-600",
  },
  {
    title: "API Reference",
    description: "Complete API documentation",
    icon: CodeIcon,
    href: "#",
    color: "text-blue-600",
  },
  {
    title: "Changelog",
    description: "Latest updates & features",
    icon: FileText,
    href: "#",
    color: "text-green-600",
  },
  {
    title: "Community",
    description: "Join our Discord server",
    icon: Users,
    href: "#",
    color: "text-purple-600",
  },
]

/**********************************************************
 *  GitHub Actions workflow
 *********************************************************/
const yamlSnippet = `# .github/workflows/pullquest-auto-comment.yml
name: PullQuest – comment on new issues

on:
  issues:
    types: [opened]

jobs:
  notify-pullquest:
    runs-on: ubuntu-latest

    env:
      # PullQuest endpoint (change if self-hosted)
      PULLQUEST_BACKEND_URL: "https://api.pullquest.io"
      # Secret API key – *store this under repository → Settings → Secrets*.
      PULLQUEST_API_KEY: \${{ secrets.PULLQUEST_API_KEY }}

    steps:
      # (optional) echo context in the Actions log
      - name: Show context
        run: |
          echo "Repo:  \${{ github.repository }}"
          echo "Issue: #\${{ github.event.issue.number }}"

      # Call the PullQuest backend
      - name: Notify PullQuest backend
        run: |
          curl -sSL -X POST "$PULLQUEST_BACKEND_URL/api/maintainer/issue-comment" \\
            -H "Authorization: Bearer $PULLQUEST_API_KEY" \\
            -H "Content-Type: application/json" \\
            -d '{
              "issue_number":  "\${{ github.event.issue.number }}",
              "repo":          "\${{ github.repository }}",
              "org":           "\${{ github.event.repository.owner.login }}",
              "issue_url":     "\${{ github.event.issue.html_url }}"
            }'

      - name: Done
        run: echo "✅ PullQuest notified successfully"`

/**********************************************************
 *  Component
 *********************************************************/
export default function DocsView() {
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState(false)

  const copyYaml = () => {
    navigator.clipboard.writeText(yamlSnippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const filteredSections = docSections.filter(
    (section) =>
      section.title.toLowerCase().includes(search.toLowerCase()) ||
      section.description.toLowerCase().includes(search.toLowerCase()) ||
      section.items.some((item) => item.title.toLowerCase().includes(search.toLowerCase())),
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tutorial":
        return <Video className="w-3 h-3" />
      case "guide":
        return <BookOpen className="w-3 h-3" />
      case "reference":
        return <FileText className="w-3 h-3" />
      default:
        return <FileText className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tutorial":
        return "text-red-600 bg-red-50"
      case "guide":
        return "text-blue-600 bg-blue-50"
      case "reference":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Everything you need to know</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive guides and documentation to help you start working with PullQuest as quickly as possible.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search documentation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* GitHub Actions Quick Setup */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CodeIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">GitHub Actions Setup</CardTitle>
                  <CardDescription className="text-gray-300">
                    Get started in under 2 minutes with our ready-to-use workflow
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={copyYaml}
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy YAML"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 rounded-lg p-4 overflow-auto">
              <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">{yamlSnippet}</pre>
            </div>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Auto-comment on issues</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Secure API key handling</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Production ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Documentation Sections */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSections.map((section) => {
                const IconComponent = section.icon
                return (
                  <Card
                    key={section.id}
                    className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                              {section.title}
                            </CardTitle>
                            <CardDescription className="text-sm">{section.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${section.badgeColor} border-0 text-xs`}>{section.badge}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {section.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group/item"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-1 rounded ${getTypeColor(item.type)}`}>{getTypeIcon(item.type)}</div>
                              <span className="text-sm font-medium text-gray-700 group-hover/item:text-blue-600">
                                {item.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{item.time}</span>
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-400 group-hover/item:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Quick Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-gray-50"
                    asChild
                  >
                    <a href={link.href}>
                      <link.icon className={`w-4 h-4 mr-3 ${link.color}`} />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{link.title}</p>
                        <p className="text-xs text-gray-600">{link.description}</p>
                      </div>
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Need Help?</CardTitle>
                <CardDescription className="text-blue-700">Can't find what you're looking for?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <a href="https://help.pullquest.io" target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Help Center
                  </a>
                </Button>
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">50+</div>
                    <div className="text-xs text-gray-600">Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">15+</div>
                    <div className="text-xs text-gray-600">Tutorials</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
