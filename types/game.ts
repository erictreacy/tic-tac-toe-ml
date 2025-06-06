export type Cell = "X" | "O" | null
export type Board = Cell[]
export type GameMode = "ai" | "friend"
export type GameState = "playing" | "won" | "draw"

export interface GameStats {
  playerWins: number
  aiWins: number
  draws: number
  totalGames: number
}

export interface AIStats {
  gamesPlayed: number
  winRate: number
  learningProgress: number
  currentStrategy: string
}
