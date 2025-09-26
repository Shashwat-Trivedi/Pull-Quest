"use client"

import { MessageCircle, GitBranch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface IssueCardProps {
  number: number
  title: string
  body: string
  author: string
  state: "open" | "closed"
  createdAt: string
  updatedAt: string
  comments: number
  labels: { name: string; color?: string }[]
  htmlUrl: string
}

export default function IssueCard(props: IssueCardProps) {
  return (
    <Card className="border hover:border-gray-300 transition-colors">
      <CardContent className="p-4 space-y-2">
        {/* ---------- header ---------- */}
        <div className="flex justify-between">
          <div>
            <a
              href={props.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              #{props.number} {props.title}
            </a>
            <div className="text-xs text-gray-500">
              opened {props.createdAt} by&nbsp;
              <strong>{props.author}</strong> • {props.state}
            </div>
          </div>

          {/* comment count */}
          <div className="flex items-center text-xs text-gray-500 space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{props.comments}</span>
          </div>
        </div>

        {/* ---------- body (first line only) ---------- */}
        {props.body && (
          <p className="text-sm text-gray-700 line-clamp-2">{props.body}</p>
        )}

        {/* ---------- labels ---------- */}
        <div className="flex flex-wrap gap-1">
          {props.labels.map(l => (
            <Badge
              key={l.name}
              style={{ backgroundColor: `#${l.color || "e1e4e8"}` }}
              className="text-[11px]"
            >
              {l.name}
            </Badge>
          ))}
        </div>

        {/* ---------- footer ---------- */}
        <div className="flex items-center text-xs text-gray-500 space-x-2 pt-2 border-t border-gray-100">
          <GitBranch className="w-3 h-3" />
          <span>updated {props.updatedAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}
