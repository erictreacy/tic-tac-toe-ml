interface AIStatsProps {
  stats: {
    gamesPlayed: number
    explorationRate: number
    learningProgress: number
    qTableSize: number
    currentStrategy: string
  }
}

export function AIStats({ stats }: AIStatsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🤖 AI Learning Status</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Learning Progress</span>
            <span className="text-sm font-bold text-purple-600">{stats.learningProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.learningProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-gray-600">Games Played</div>
            <div className="text-xl font-bold text-gray-800">{stats.gamesPlayed}</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-gray-600">Strategy</div>
            <div className="text-lg font-bold text-purple-600">{stats.currentStrategy}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-gray-600">Exploration Rate</div>
            <div className="text-lg font-bold text-blue-600">{(stats.explorationRate * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-gray-600">Knowledge Base</div>
            <div className="text-lg font-bold text-green-600">{stats.qTableSize} states</div>
          </div>
        </div>
      </div>
    </div>
  )
}
