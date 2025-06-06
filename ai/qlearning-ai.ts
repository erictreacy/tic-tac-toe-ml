import type { Board, Cell } from "../types/game"

interface QState {
  board: string
  action: number
  value: number
}

export class QLearningAI {
  private qTable: Map<string, number[]> = new Map()
  private learningRate = 0.1
  private discountFactor = 0.9
  private explorationRate = 0.3
  private minExploration = 0.05
  private explorationDecay = 0.995
  private gamesPlayed = 0

  private boardToString(board: Board): string {
    return board.map((cell) => cell || "_").join("")
  }

  private getQValues(boardState: string): number[] {
    if (!this.qTable.has(boardState)) {
      this.qTable.set(boardState, new Array(9).fill(0))
    }
    return this.qTable.get(boardState)!
  }

  private getAvailableMoves(board: Board): number[] {
    return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
  }

  private evaluateBoard(board: Board, player: Cell): number {
    const winner = this.checkWinner(board)
    if (winner === "O") return 10 // AI wins
    if (winner === "X") return -10 // Human wins
    if (this.isDraw(board)) return 0
    return 0 // Game continues
  }

  private checkWinner(board: Board): Cell {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  private isDraw(board: Board): boolean {
    return board.every((cell) => cell !== null) && !this.checkWinner(board)
  }

  public getBestMove(board: Board): number {
    const availableMoves = this.getAvailableMoves(board)
    if (availableMoves.length === 0) return -1

    const boardState = this.boardToString(board)
    const qValues = this.getQValues(boardState)

    // Exploration vs Exploitation
    if (Math.random() < this.explorationRate) {
      // Random exploration
      return availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }

    // Exploitation - choose best known move
    let bestMove = availableMoves[0]
    let bestValue = Number.NEGATIVE_INFINITY

    for (const move of availableMoves) {
      if (qValues[move] > bestValue) {
        bestValue = qValues[move]
        bestMove = move
      }
    }

    return bestMove
  }

  public updateQValue(prevBoard: Board, action: number, newBoard: Board, reward: number): void {
    const prevState = this.boardToString(prevBoard)
    const newState = this.boardToString(newBoard)

    const prevQValues = this.getQValues(prevState)
    const newQValues = this.getQValues(newState)

    const maxFutureQ = Math.max(...newQValues)
    const currentQ = prevQValues[action]

    // Q-learning update rule
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxFutureQ - currentQ)

    prevQValues[action] = newQ
  }

  public gameFinished(finalBoard: Board, winner: Cell): void {
    this.gamesPlayed++

    // Decay exploration rate
    this.explorationRate = Math.max(this.minExploration, this.explorationRate * this.explorationDecay)
  }

  public getStats(): {
    gamesPlayed: number
    explorationRate: number
    learningProgress: number
    qTableSize: number
    currentStrategy: string
  } {
    const learningProgress = Math.min(100, (this.gamesPlayed / 100) * 100)
    const strategy = this.explorationRate > 0.2 ? "Exploring" : this.explorationRate > 0.1 ? "Learning" : "Expert"

    return {
      gamesPlayed: this.gamesPlayed,
      explorationRate: Math.round(this.explorationRate * 100) / 100,
      learningProgress: Math.round(learningProgress),
      qTableSize: this.qTable.size,
      currentStrategy: strategy,
    }
  }

  public reset(): void {
    this.qTable.clear()
    this.explorationRate = 0.3
    this.gamesPlayed = 0
  }
}

export const qLearningAI = new QLearningAI()
