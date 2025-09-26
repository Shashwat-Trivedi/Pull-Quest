"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, GitPullRequest, Clock, Download, Lock, Calendar } from "lucide-react"

const reportCards = [
  {
    title: "Code Review Summary",
    description: "Overview of all code reviews in the selected period",
    icon: GitPullRequest,
    value: "124",
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    title: "Average Review Time",
    description: "Mean time from PR creation to approval",
    icon: Clock,
    value: "2.4h",
    change: "-8%",
    changeType: "positive" as const,
  },
  {
    title: "Issues Found",
    description: "Total issues identified by CodeRabbit",
    icon: TrendingUp,
    value: "1,247",
    change: "+23%",
    changeType: "neutral" as const,
  },
  {
    title: "Code Quality Score",
    description: "Overall code quality rating",
    icon: BarChart3,
    value: "8.7/10",
    change: "+0.3",
    changeType: "positive" as const,
  },
]

const availableReports = [
  {
    name: "Weekly Code Review Report",
    description: "Detailed analysis of code reviews, patterns, and team performance",
    frequency: "Weekly",
    lastGenerated: "2 days ago",
  },
  {
    name: "Monthly Quality Trends",
    description: "Long-term code quality trends and improvement suggestions",
    frequency: "Monthly",
    lastGenerated: "1 week ago",
  },
  {
    name: "Team Performance Analytics",
    description: "Individual and team-level performance metrics and insights",
    frequency: "Bi-weekly",
    lastGenerated: "3 days ago",
  },
  {
    name: "Security Vulnerability Report",
    description: "Security issues found and remediation recommendations",
    frequency: "Daily",
    lastGenerated: "1 day ago",
  },
]

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-600 mt-1">
                Analytics and insights for your code reviews and team performance.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select defaultValue="30">
                <SelectTrigger className="w-32 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Premium Feature
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {reportCards.map((card, index) => (
              <Card key={index} className="relative">
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <card.icon className="w-5 h-5 text-gray-600" />
                    <Badge
                      variant="secondary"
                      className={
                        card.changeType === "positive" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }
                    >
                      {card.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                  <CardDescription className="text-sm">{card.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
            {availableReports.map((report, index) => (
              <Card key={index} className="relative">
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{report.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {report.frequency}
                        </span>
                        <span>Last generated: {report.lastGenerated}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" disabled>
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
