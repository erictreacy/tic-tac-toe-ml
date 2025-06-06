import { DeepQNetwork } from "./neural-network"
import { MonteCarloTreeSearch } from "./mcts"

interface Experience {
  state: number[]
  action: number
  reward: number
  nextState: number[]
  done: boolean
}

export class AdvancedAI {
  private dqn: DeepQNetwork
  private mcts: MonteCarloTreeSearch
  private experienceBuffer: Experience[] = []
  private maxBufferSize = 10000
  private gamesPlayed = 0
  private wins = 0
  private selfPlayGames = 0
  private isTraining = false

  // Strategy weights that adapt over time
  private strategyWeights = {
    dqn: 0.4,
    mcts: 0.4,
    minimax: 0.2,
  }

  constructor() {
    this.dqn = new DeepQNetwork()
    this.mcts = new MonteCarloTreeSearch()
    this.initializeSelfPlay()
  }

  private async initializeSelfPlay(): Promise<void> {
    // Run self-play games in background to improve the AI
    setTimeout(() => this.runSelfPlaySession(), 1000)
  }

  private boardToFeatures(board: number[]): number[] {
    const features: number[] = [...board]

    // Add strategic features
    features.push(this.getCenterControl(board))
    features.push(this.getCornerControl(board))
    features.push(this.getEdgeControl(board))
    features.push(this.getThreatLevel(board, 1)) // AI threats
    features.push(this.getThreatLevel(board, -1)) // Human threats
    features.push(this.getForkOpportunities(board, 1))
    features.push(this.getForkOpportunities(board, -1))
    features.push(this.getBlockingMoves(board))
    features.push(this.getWinningMoves(board))

    // Normalize features
    return features.map((f) => f / 10)
  }

  private getCenterControl(board: number[]): number {
    return board[4] === 1 ? 5 : board[4] === -1 ? -5 : 0
  }

  private getCornerControl(board: number[]): number {
    const corners = [0, 2, 6, 8]
    return corners.reduce((sum, pos) => sum + (board[pos] === 1 ? 1 : board[pos] === -1 ? -1 : 0), 0)
  }

  private getEdgeControl(board: number[]): number {
    const edges = [1, 3, 5, 7]
    return edges.reduce((sum, pos) => sum + (board[pos] === 1 ? 1 : board[pos] === -1 ? -1 : 0), 0)
  }

  private getThreatLevel(board: number[], player: number): number {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    let threats = 0
    for (const pattern of winPatterns) {
      const playerCount = pattern.filter((pos) => board[pos] === player).length
      const emptyCount = pattern.filter((pos) => board[pos] === 0).length
      if (playerCount === 2 && emptyCount === 1) threats++
    }
    return threats
  }

  private getForkOpportunities(board: number[], player: number): number {
    let forks = 0
    const availableMoves = board.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)

    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = player
      if (this.getThreatLevel(testBoard, player) >= 2) forks++
    }
    return forks
  }

  private getBlockingMoves(board: number[]): number {
    return this.getThreatLevel(board, -1) // Count opponent threats that need blocking
  }

  private getWinningMoves(board: number[]): number {
    return this.getThreatLevel(board, 1) // Count immediate winning opportunities
  }

  public getBestMove(board: number[]): number {
    const numericBoard = board.map((cell) => (cell === "X" ? -1 : cell === "O" ? 1 : 0))

    // Get moves from different strategies
    const dqnMove = this.getDQNMove(numericBoard)
    const mctsMove = this.mcts.getBestMove(numericBoard, 500)
    const minimaxMove = this.getMinimaxMove(numericBoard)

    // Ensemble decision making
    const moveScores = new Map<number, number>()

    if (dqnMove !== -1) {
      moveScores.set(dqnMove, (moveScores.get(dqnMove) || 0) + this.strategyWeights.dqn)
    }
    if (mctsMove !== -1) {
      moveScores.set(mctsMove, (moveScores.get(mctsMove) || 0) + this.strategyWeights.mcts)
    }
    if (minimaxMove !== -1) {
      moveScores.set(minimaxMove, (moveScores.get(minimaxMove) || 0) + this.strategyWeights.minimax)
    }

    // Add some strategic bonuses
    const availableMoves = numericBoard.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)
    for (const move of availableMoves) {
      const testBoard = [...numericBoard]
      testBoard[move] = 1

      // Bonus for winning moves
      if (this.checkWinner(testBoard) === 1) {
        moveScores.set(move, (moveScores.get(move) || 0) + 10)
      }

      // Bonus for blocking opponent wins
      const blockBoard = [...numericBoard]
      blockBoard[move] = -1
      if (this.checkWinner(blockBoard) === -1) {
        moveScores.set(move, (moveScores.get(move) || 0) + 8)
      }

      // Bonus for center and corners
      if (move === 4) moveScores.set(move, (moveScores.get(move) || 0) + 2)
      if ([0, 2, 6, 8].includes(move)) moveScores.set(move, (moveScores.get(move) || 0) + 1)
    }

    // Select best move
    let bestMove = -1
    let bestScore = Number.NEGATIVE_INFINITY
    for (const [move, score] of moveScores) {
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove !== -1 ? bestMove : availableMoves[0] || -1
  }

  private getDQNMove(board: number[]): number {
    const features = this.boardToFeatures(board)
    const qValues = this.dqn.forward(features)

    // Mask invalid moves
    const availableMoves = board.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)
    let bestMove = -1
    let bestValue = Number.NEGATIVE_INFINITY

    for (const move of availableMoves) {
      if (qValues[move] > bestValue) {
        bestValue = qValues[move]
        bestMove = move
      }
    }

    return bestMove
  }

  private getMinimaxMove(board: number[]): number {
    const availableMoves = board.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)
    let bestMove = -1
    let bestScore = Number.NEGATIVE_INFINITY

    for (const move of availableMoves) {
      const newBoard = [...board]
      newBoard[move] = 1
      const score = this.minimax(newBoard, 0, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private minimax(board: number[], depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
    const winner = this.checkWinner(board)
    if (winner === 1) return 10 - depth
    if (winner === -1) return depth - 10
    if (board.every((cell) => cell !== 0)) return 0

    const availableMoves = board.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)

    if (isMaximizing) {
      let maxScore = Number.NEGATIVE_INFINITY
      for (const move of availableMoves) {
        const newBoard = [...board]
        newBoard[move] = 1
        const score = this.minimax(newBoard, depth + 1, false, alpha, beta)
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break
      }
      return maxScore
    } else {
      let minEval = Number.POSITIVE_INFINITY
      for (const move of availableMoves) {
        const newBoard = [...board]
        newBoard[move] = -1
        const evaluation = this.minimax(newBoard, depth + 1, true, alpha, beta)
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        if (beta <= alpha) break
      }
      return minEval
    }
  }

  private checkWinner(board: number[]): number {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return 0
  }

  public addExperience(state: number[], action: number, reward: number, nextState: number[], done: boolean): void {
    this.experienceBuffer.push({ state, action, reward, nextState, done })

    if (this.experienceBuffer.length > this.maxBufferSize) {
      this.experienceBuffer.shift()
    }

    // Train periodically
    if (this.experienceBuffer.length >= 32 && this.experienceBuffer.length % 10 === 0) {
      this.dqn.train(this.experienceBuffer.slice(-32))
    }
  }

  public gameFinished(finalBoard: number[], winner: number): void {
    this.gamesPlayed++
    if (winner === 1) this.wins++

    // Adapt strategy weights based on performance
    const winRate = this.wins / this.gamesPlayed
    if (winRate > 0.7) {
      // If doing well, rely more on current strategies
      this.strategyWeights.dqn = Math.min(0.5, this.strategyWeights.dqn + 0.01)
    } else if (winRate < 0.3) {
      // If struggling, explore more with MCTS
      this.strategyWeights.mcts = Math.min(0.6, this.strategyWeights.mcts + 0.02)
    }

    // Normalize weights
    const total = Object.values(this.strategyWeights).reduce((a, b) => a + b, 0)
    for (const key in this.strategyWeights) {
      this.strategyWeights[key as keyof typeof this.strategyWeights] /= total
    }
  }

  private async runSelfPlaySession(): Promise<void> {
    if (this.isTraining) return
    this.isTraining = true

    // Run 10 self-play games
    for (let game = 0; game < 10; game++) {
      await this.playSelfPlayGame()
      this.selfPlayGames++
    }

    this.isTraining = false

    // Schedule next session
    setTimeout(() => this.runSelfPlaySession(), 30000) // Every 30 seconds
  }

  private async playSelfPlayGame(): Promise<void> {
    const board = new Array(9).fill(0)
    let currentPlayer = 1
    const gameHistory: Array<{ state: number[]; action: number }> = []

    while (!this.checkWinner(board) && board.includes(0)) {
      const move =
        currentPlayer === 1
          ? this.getBestMove(board.map((c) => (c === -1 ? "X" : c === 1 ? "O" : null)))
          : this.getRandomMove(board)

      if (move !== -1) {
        gameHistory.push({ state: [...board], action: move })
        board[move] = currentPlayer
        currentPlayer = -currentPlayer
      } else {
        break
      }
    }

    // Learn from the game
    const winner = this.checkWinner(board)
    for (let i = 0; i < gameHistory.length; i++) {
      const { state, action } = gameHistory[i]
      const nextState = i < gameHistory.length - 1 ? gameHistory[i + 1].state : board
      const reward = winner === 1 ? (i % 2 === 0 ? 1 : -1) : winner === -1 ? (i % 2 === 0 ? -1 : 1) : 0

      this.addExperience(state, action, reward, nextState, i === gameHistory.length - 1)
    }
  }

  private getRandomMove(board: number[]): number {
    const availableMoves = board.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1
  }

  public getAdvancedStats(): {
    gamesPlayed: number
    winRate: number
    selfPlayGames: number
    experienceBufferSize: number
    strategyWeights: typeof this.strategyWeights
    networkInfo: { layers: number[]; totalWeights: number }
    isTraining: boolean
  } {
    return {
      gamesPlayed: this.gamesPlayed,
      winRate: this.gamesPlayed > 0 ? this.wins / this.gamesPlayed : 0,
      selfPlayGames: this.selfPlayGames,
      experienceBufferSize: this.experienceBuffer.length,
      strategyWeights: { ...this.strategyWeights },
      networkInfo: this.dqn.getNetworkInfo(),
      isTraining: this.isTraining,
    }
  }

  public reset(): void {
    this.dqn = new DeepQNetwork()
    this.experienceBuffer = []
    this.gamesPlayed = 0
    this.wins = 0
    this.selfPlayGames = 0
    this.strategyWeights = { dqn: 0.4, mcts: 0.4, minimax: 0.2 }
  }
}

export const advancedAI = new AdvancedAI()
