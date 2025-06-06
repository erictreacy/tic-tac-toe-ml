interface AdvancedStatsProps {
  stats: {
    gamesPlayed: number
    winRate: number
    selfPlayGames: number
    experienceBufferSize: number
    strategyWeights: {
      dqn: number
      mcts: number
      minimax: number
    }
    networkInfo: {
      layers: number[]
      totalWeights: number
    }
    isTraining: boolean
  }
}

export function AdvancedStats({ stats }: AdvancedStatsProps) {
  return (
    <div className="space-y-4">
      {/* AI Status - Bauhaus Card */}
      <div className="relative bg-white border-4 border-black">
        {/* Geometric header */}
        <div className="bg-black text-white p-4 relative">
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] border-l-transparent border-b-red-500"></div>
          <h3 className="text-lg font-black uppercase tracking-wider">AI STATUS</h3>
          {stats.isTraining && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="w-3 h-3 bg-red-500 animate-pulse"></div>
              <span className="font-bold">TRAINING</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-600 text-white p-3 relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400"></div>
              <div className="text-xs font-bold uppercase">Win Rate</div>
              <div className="text-xl font-black">{(stats.winRate * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-red-500 text-white p-3 relative">
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-yellow-400"></div>
              <div className="text-xs font-bold uppercase">Self-Play</div>
              <div className="text-xl font-black">{stats.selfPlayGames}</div>
            </div>
          </div>

          {/* Strategy Distribution - Bauhaus Bars */}
          <div>
            <div className="text-sm font-black uppercase mb-2 tracking-wider">STRATEGY MIX</div>
            <div className="space-y-1">
              {Object.entries(stats.strategyWeights).map(([strategy, weight], index) => (
                <div key={strategy} className="flex items-center gap-2">
                  <div className="w-12 text-xs font-black uppercase">{strategy}</div>
                  <div className="flex-1 h-4 bg-gray-200 relative">
                    <div
                      className={`h-full ${index === 0 ? "bg-blue-600" : index === 1 ? "bg-red-500" : "bg-yellow-400"}`}
                      style={{ width: `${weight * 100}%` }}
                    />
                    <div className="absolute right-1 top-0 h-full flex items-center">
                      <span className="text-xs font-bold">{(weight * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neural Network - Geometric Representation */}
          <div className="bg-black text-white p-3 relative">
            <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-400"></div>
            <div className="text-xs font-bold uppercase mb-1">Neural Network</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-300">Layers:</span>
                <div className="font-mono text-yellow-400">{stats.networkInfo.layers.join("→")}</div>
              </div>
              <div>
                <span className="text-gray-300">Params:</span>
                <div className="font-bold text-red-400">{(stats.networkInfo.totalWeights / 1000).toFixed(1)}K</div>
              </div>
            </div>
          </div>

          {/* Experience Buffer - Bauhaus Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black uppercase">Experience</span>
              <span className="text-xs font-bold">{stats.experienceBufferSize}/10K</span>
            </div>
            <div className="h-3 bg-gray-200 relative">
              <div className="h-full bg-blue-600" style={{ width: `${(stats.experienceBufferSize / 10000) * 100}%` }} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Bauhaus Info Card */}
      <div className="bg-yellow-400 border-4 border-black p-4 relative">
        <div className="absolute top-0 right-0 w-6 h-6 bg-red-500"></div>
        <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[16px] border-t-[16px] border-r-transparent border-t-blue-600"></div>

        <h4 className="text-lg font-black uppercase mb-3 tracking-wider">AI METHODS</h4>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2 items-start">
            <div className="w-4 h-4 bg-blue-600 flex-shrink-0 mt-0.5"></div>
            <div>
              <strong className="font-black uppercase">DQN:</strong> Deep neural network learning
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <div className="w-4 h-4 bg-red-500 flex-shrink-0 mt-0.5"></div>
            <div>
              <strong className="font-black uppercase">MCTS:</strong> Tree search algorithm
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <div className="w-4 h-4 bg-black flex-shrink-0 mt-0.5"></div>
            <div>
              <strong className="font-black uppercase">Minimax:</strong> Game theory optimization
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
