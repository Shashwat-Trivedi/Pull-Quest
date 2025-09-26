import { Coins, TrendingUp, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"

interface Stake {
  id: number
  status: string
  issue: string
  repository: string
  owner: string
  coinsStaked: number
  coinsGained: number
  xpGained: number
  dateClosed: string | null
}

interface StakesListProps {
  stakes: Stake[]
}

export function StakesList({ stakes }: StakesListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />
      case "Accepted":
        return <CheckCircle className="w-4 h-4" />
      case "Rejected":
        return <XCircle className="w-4 h-4" />
      case "Expired":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "Accepted":
        return "text-green-700 bg-green-50 border-green-200"
      case "Rejected":
        return "text-red-700 bg-red-50 border-red-200"
      case "Expired":
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
      <div className="px-8 py-6 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Stakes History</h2>
      </div>
      <div className="divide-y divide-neutral-100">
        {stakes.map((stake) => (
          <div key={stake.id} className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(stake.status)}`}
                  >
                    {getStatusIcon(stake.status)}
                    <span className="ml-1.5">{stake.status}</span>
                  </span>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">{stake.issue}</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  <span className="font-medium">
                    {stake.owner}/{stake.repository}
                  </span>
                </p>
                <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 mr-2 text-neutral-500" />
                    <span>
                      Staked: <span className="font-medium">{stake.coinsStaked}</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 mr-2 text-neutral-500" />
                    <span
                      className={
                        stake.coinsGained > 0
                          ? "text-neutral-800 font-medium"
                          : stake.coinsGained < 0
                            ? "text-neutral-500"
                            : ""
                      }
                    >
                      Gained: {stake.coinsGained > 0 ? "+" : ""}
                      {stake.coinsGained}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-neutral-500" />
                    <span
                      className={
                        stake.xpGained > 0
                          ? "text-neutral-800 font-medium"
                          : stake.xpGained < 0
                            ? "text-neutral-500"
                            : ""
                      }
                    >
                      XP: {stake.xpGained > 0 ? "+" : ""}
                      {stake.xpGained}
                    </span>
                  </div>
                  {stake.dateClosed && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                      <span>Closed: {stake.dateClosed}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
