interface GameStatsProps {
  aiStats: {
    gamesPlayed: number
    winRate: number
    explorationRate: number
  }
  playerStats: {
    wins: number
    losses: number
    draws: number
  }
}

export function GameStats({ aiStats, playerStats }: GameStatsProps) {
  const totalGames = playerStats.wins + playerStats.losses + playerStats.draws
  const playerWinRate = totalGames > 0 ? (playerStats.wins / totalGames) * 100 : 0

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Game Statistics</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-blue-600">Your Stats</h4>
          <p>Wins: {playerStats.wins}</p>
          <p>Losses: {playerStats.losses}</p>
          <p>Draws: {playerStats.draws}</p>
          <p>Win Rate: {playerWinRate.toFixed(1)}%</p>
        </div>
        <div>
          <h4 className="font-medium text-red-600">AI Stats</h4>
          <p>Games Played: {aiStats.gamesPlayed}</p>
          <p>Win Rate: {(aiStats.winRate * 100).toFixed(1)}%</p>
          <p>Learning: {((1 - aiStats.explorationRate) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}
