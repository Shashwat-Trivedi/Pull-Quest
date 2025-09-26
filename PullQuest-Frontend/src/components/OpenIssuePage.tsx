// src/pages/maintainer/OpenIssuePage.tsx
"use client"

import { useLocation, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OpenIssuePage() {
  const { number } = useParams<{ number: string }>()
  const { state } = useLocation() as { state: any }

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold">
        New Issue for PR #{number}
      </h1>

      <Card className="border">
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder={`[Bounty] ${state?.title ?? ""}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (Markdown supported)
            </label>
            <textarea
              rows={8}
              className="w-full border rounded px-3 py-2 font-mono"
              placeholder="Describe the bug, feature, or bounty details..."
            />
          </div>

          {/* Coin reward */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Bounty Amount (coins)
            </label>
            <input
              type="number"
              min={1}
              className="w-32 border rounded px-3 py-2"
              placeholder="100"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button className="bg-green-600 hover:bg-green-700">
              Create Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
