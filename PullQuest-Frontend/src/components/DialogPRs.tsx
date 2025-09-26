"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Zap,
  Clock,
  Users,
  TestTube,
  Gift,
  GitMerge,
  Award,
  CheckCircle2,
} from "lucide-react"

interface MergeFeedbackDialogProps {
  showMergeDialog: boolean
  setShowMergeDialog: (show: boolean) => void
  onMergePR: () => void
  onSubmitFeedback: (feedback: {
    ratings: Record<string, number>
    bonuses: Record<string, boolean>
    totalScore: number
    bonusScore: number
  }) => void
}

const questions = [
  "Code Quality & Standards",
  "Documentation & Comments",
  "Testing Coverage",
  "Performance Impact",
  "Security Considerations",
]

const bonusItems = [
  {
    text: "Issue was bounty-backed",
    points: 10,
    icon: Gift,
    color: "text-purple-600",
  },
  {
    text: "PR merged within 24–48 hrs",
    points: 5,
    icon: Clock,
    color: "text-blue-600",
  },
  {
    text: "Contributor also reviewed other PRs",
    points: 5,
    icon: Users,
    color: "text-green-600",
  },
  {
    text: "Contributor added meaningful tests",
    points: 10,
    icon: TestTube,
    color: "text-orange-600",
  },
]

const getSliderColor = (value: number) => {
  if (value <= 1) return "text-red-500"
  if (value <= 2) return "text-orange-500"
  if (value <= 3) return "text-yellow-500"
  if (value <= 4) return "text-blue-500"
  return "text-green-500"
}

const getSliderLabel = (value: number) => {
  const labels = ["Poor", "Below Average", "Average", "Good", "Very Good", "Excellent"]
  return labels[value] || "Not Rated"
}

export default function MergeFeedbackDialog({
  showMergeDialog,
  setShowMergeDialog,
  onMergePR,
  onSubmitFeedback,
}: MergeFeedbackDialogProps) {
  const [sliderValues, setSliderValues] = useState<Record<string, any>>({})

  const totalScore = Object.entries(sliderValues)
    .filter(([key]) => questions.includes(key))
    .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0)

  const bonusScore = bonusItems.filter((item) => sliderValues[item.text]).reduce((sum, item) => sum + item.points, 0)

  const maxScore = questions.length * 5
  const scorePercentage = (totalScore / maxScore) * 100

  return (
    <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GitMerge className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Merge Feedback</DialogTitle>
              <p className="text-gray-600 mt-1">Rate this pull request before merging to help improve code quality</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Score Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Current Score</h3>
              </div>
              <Badge
                variant="secondary"
                className={`px-3 py-1 text-sm font-medium ${
                  scorePercentage >= 80
                    ? "bg-green-100 text-green-800"
                    : scorePercentage >= 60
                    ? "bg-blue-100 text-blue-800"
                    : scorePercentage >= 40
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {totalScore}/{maxScore} points ({Math.round(scorePercentage)}%)
              </Badge>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  scorePercentage >= 80
                    ? "bg-green-500"
                    : scorePercentage >= 60
                    ? "bg-blue-500"
                    : scorePercentage >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>

            {bonusScore > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Bonus XP: +{bonusScore} points</span>
              </div>
            )}
          </div>

          {/* Rating Questions */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Quality Assessment</h3>
            </div>

            {questions.map((question, idx) => {
              const value = sliderValues[question] || 0
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900">{question}</Label>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getSliderColor(value)}`}>{getSliderLabel(value)}</span>
                      <Badge variant="outline" className="text-xs">
                        {value}/5
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Slider
                      value={[value]}
                      min={0}
                      max={5}
                      step={1}
                      onValueChange={(newValue) =>
                        setSliderValues((prev) => ({ ...prev, [question]: newValue[0] }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Poor</span>
                      <span>Average</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bonus Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Bonus Points</h3>
              <Badge variant="outline" className="text-xs text-gray-600">
                Optional
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bonusItems.map((item) => {
                const Icon = item.icon
                const isChecked = sliderValues[item.text] || false

                return (
                  <label
                    key={item.text}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setSliderValues((prev) => ({
                            ...prev,
                            [item.text]: e.target.checked,
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isChecked ? "border-green-500 bg-green-500" : "border-gray-300"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-medium text-gray-900">{item.text}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">+{item.points} XP</span>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              Total Score: <span className="font-semibold">{totalScore + bonusScore} points</span>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowMergeDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                    const ratings = Object.fromEntries(
                    Object.entries(sliderValues).filter(([k]) => questions.includes(k))
                    )
                    const bonuses = Object.fromEntries(
                    bonusItems.map(({ text }) => [text, !!sliderValues[text]])
                    )
                
                    console.log("📊 Merge Feedback Summary:")
                    console.log("Ratings:", ratings)
                    console.log("Bonuses:", bonuses)
                    console.log("Total Score:", totalScore)
                    console.log("Bonus Score:", bonusScore)
                
                    onSubmitFeedback({
                    ratings,
                    bonuses,
                    totalScore,
                    bonusScore,
                    })
                
                    setShowMergeDialog(false)
                    onMergePR()
                }}
  
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                disabled={totalScore === 0}
              >
                <GitMerge className="w-4 h-4 mr-2" />
                Submit & Merge PR
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
