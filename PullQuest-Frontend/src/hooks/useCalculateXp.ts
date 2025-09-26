import { useCallback } from "react"

type FeedbackData = {
  ratings: Record<string, number>
  bonuses: Record<string, boolean>
  tags?: string[]
  complexityFactors?: string[]
}

type XPResult = {
  baseScore: number
  bonusScore: number
  totalXP: number
  multiplierXp: number
  appliedMultiplier: number
}

export function useCalculateXp() {
  const calculateXp = useCallback((feedback: FeedbackData): XPResult => {
    const baseXpMap: Record<string, number> = {
      "UI Fix": 10,
      "Docs": 5,
      "Major Backend Change": 20,
      "Normal Backend Change": 15,
      "Accessibility Improvement": 8,
      "Code Cleanup": 7,
      "Bug Fix": 12,
      "Deployment Script": 6,
    }

    const multiplierMap: Record<string, number> = {
      "Affects < 3 files": 1.0,
      "Affects multiple modules": 1.5,
      "Refactors/optimizes existing logic": 1.2,
      "Introduces a new module": 1.8,
      "Involves test cases / performance boost": 1.3,
      "Changes CI/CD config": 1.1,
      "Impacts user-facing flows": 1.6,
    }

    const tagXp = (feedback.tags ?? []).reduce((sum, tag) => sum + (baseXpMap[tag] || 0), 0)
    const ratingXp = Object.values(feedback.ratings).reduce((sum, val) => sum + val, 0)
    const baseScore = tagXp + ratingXp

    const maxMultiplier =
      Math.max(
        ...(feedback.complexityFactors?.map(f => multiplierMap[f] ?? 1.0) ?? [1.0])
      ) || 1.0

    const multiplierXp = tagXp * maxMultiplier

    const bonusPoints: Record<string, number> = {
      "Issue was bounty-backed": 10,
      "PR merged within 24–48 hrs": 5,
      "Contributor also reviewed other PRs": 5,
      "Contributor added meaningful tests": 10,
    }

    const bonusScore = Object.entries(feedback.bonuses).reduce((sum, [key, active]) => {
      return active ? sum + (bonusPoints[key] || 0) : sum
    }, 0)

    const totalXP = multiplierXp + baseScore + bonusScore

    return {
      baseScore,
      bonusScore,
      totalXP,
      multiplierXp,
      appliedMultiplier: maxMultiplier,
    }
  }, [])

  return { calculateXp }
}
