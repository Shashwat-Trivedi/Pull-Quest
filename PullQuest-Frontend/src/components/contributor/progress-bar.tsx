interface ProgressBarProps {
    currentXP: number
    nextRankXP: number
    nextRankName: string
  }
  
  export function ProgressBar({ currentXP, nextRankXP, nextRankName }: ProgressBarProps) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-neutral-700">Progress to {nextRankName}</span>
          <span className="text-sm text-neutral-500">
            {currentXP} / {nextRankXP} XP
          </span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div
            className="bg-neutral-900 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentXP / nextRankXP) * 100}%` }}
          ></div>
        </div>
      </div>
    )
  }
  