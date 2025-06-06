import { type Board, type Player, checkWinner, getAvailableMoves } from "./gameLogic"

interface GameResult {
  board: Board
  winner: Player
  aiMove: number
}

class TicTacToeAI {
  private gameHistory: GameResult[] = []
  private learningRate = 0.1
  private explorationRate = 0.3

  // Minimax algorithm with alpha-beta pruning
  private minimax(
    board: Board,
    depth: number,
    isMaximizing: boolean,
    alpha = Number.NEGATIVE_INFINITY,
    beta: number = Number.POSITIVE_INFINITY,
  ): number {
    const winner = checkWinner(board)

    if (winner === "O") return 10 - depth // AI wins
    if (winner === "X") return depth - 10 // Human wins
    if (getAvailableMoves(board).length === 0) return 0 // Draw

    if (isMaximizing) {
      let maxScore = Number.NEGATIVE_INFINITY
      for (const move of getAvailableMoves(board)) {
        const newBoard = [...board]
        newBoard[move] = "O"
        const eval = this.minimax(newBoard, depth + 1, false, alpha, beta)
        maxScore = Math.max(maxScore, eval)
        alpha = Math.max(alpha, eval)
        if (beta <= alpha) break
      }
      return maxScore
    } else {
      let minEval = Number.POSITIVE_INFINITY
      for (const move of getAvailableMoves(board)) {
        const newBoard = [...board]
        newBoard[move] = "X"
        const eval = this.minimax(newBoard, depth + 1, true, alpha, beta)
        minEval = Math.min(minEval, eval)
        beta = Math.min(beta, eval)
        if (beta <= alpha) break
      }
      return minEval
    }
  }

  // Get move scores based on historical performance
  private getMoveScore(board: Board, move: number): number {
    const relevantGames = this.gameHistory.filter(
      (game) => JSON.stringify(game.board.slice(0, move)) === JSON.stringify(board.slice(0, move)),
    )

    if (relevantGames.length === 0) return 0

    const winRate = relevantGames.filter((game) => game.winner === "O").length / relevantGames.length
    return winRate * 2 - 1 // Convert to range [-1, 1]
  }

  public getBestMove(board: Board): number {
    const availableMoves = getAvailableMoves(board)

    if (availableMoves.length === 0) return -1

    // Exploration vs exploitation
    if (Math.random() < this.explorationRate) {
      // Random move for exploration
      return availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }

    let bestMove = availableMoves[0]
    let bestScore = Number.NEGATIVE_INFINITY

    for (const move of availableMoves) {
      const newBoard = [...board]
      newBoard[move] = "O"

      // Combine minimax score with learned experience
      const minimaxScore = this.minimax(newBoard, 0, false)
      const experienceScore = this.getMoveScore(board, move)
      const combinedScore = minimaxScore + experienceScore * this.learningRate

      if (combinedScore > bestScore) {
        bestScore = combinedScore
        bestMove = move
      }
    }

    return bestMove
  }

  public learnFromGame(board: Board, winner: Player, aiMove: number): void {
    this.gameHistory.push({ board: [...board], winner, aiMove })

    // Reduce exploration rate as AI learns
    if (this.gameHistory.length > 10) {
      this.explorationRate = Math.max(0.1, this.explorationRate * 0.95)
    }
  }

  public getStats(): { gamesPlayed: number; winRate: number; explorationRate: number } {
    const gamesPlayed = this.gameHistory.length
    const wins = this.gameHistory.filter((game) => game.winner === "O").length
    const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0

    return {
      gamesPlayed,
      winRate: Math.round(winRate * 100) / 100,
      explorationRate: Math.round(this.explorationRate * 100) / 100,
    }
  }
}

export const aiPlayer = new TicTacToeAI()
