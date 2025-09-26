import { Coins, Trophy, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  coins: number
  xp: number
  currentRank: string
  xpToNext: number
}

export function StatsCards({ coins, xp, currentRank, xpToNext }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mr-4">
            <Coins className="w-6 h-6 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Coins</p>
            <p className="text-2xl font-semibold text-neutral-900">{coins}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">XP Level</p>
            <p className="text-2xl font-semibold text-neutral-900">{xp}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mr-4">
            <Trophy className="w-6 h-6 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Rank</p>
            <p className="text-base font-semibold text-neutral-900 leading-tight">{currentRank}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-neutral-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">XP to Next Rank</p>
            <p className="text-2xl font-semibold text-neutral-900">{xpToNext > 0 ? xpToNext : "Max"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
