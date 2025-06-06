"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Board } from "./components/Board"
import { AIStats } from "./components/AIStats"
import { qLearningAI } from "./ai/qlearning-ai"
import { createEmptyBoard, checkWinner, isDraw, WINNING_COMBINATIONS } from "./utils/game-utils"
import type { Board as BoardType, Cell, GameMode, GameStats } from "./types/game"

export default function TicTacToeML() {
  const [board, setBoard] = useState<BoardType>(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Cell>("X")
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [gameState, setGameState] = useState<"playing" | "won" | "draw">("playing")
  const [winner, setWinner] = useState<Cell>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [winningCells, setWinningCells] = useState<number[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    totalGames: 0,
  })
  const [prevBoard, setPrevBoard] = useState<BoardType | null>(null)
  const [lastAIMove, setLastAIMove] = useState<number | null>(null)

  const findWinningCells = useCallback((board: BoardType): number[] => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return combination
      }
    }
    return []
  }, [])

  const updateGameState = useCallback(() => {
    const gameWinner = checkWinner(board)
    const gameDraw = isDraw(board)

    if (gameWinner) {
      setWinner(gameWinner)
      setGameState("won")
      setWinningCells(findWinningCells(board))

      // Update stats
      setGameStats((prev) => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        playerWins: gameWinner === "X" ? prev.playerWins + 1 : prev.playerWins,
        aiWins: gameWinner === "O" ? prev.aiWins + 1 : prev.aiWins,
      }))

      // AI learning update
      if (gameMode === "ai" && prevBoard && lastAIMove !== null) {
        const reward = gameWinner === "O" ? 10 : gameWinner === "X" ? -10 : 0
        qLearningAI.updateQValue(prevBoard, lastAIMove, board, reward)
        qLearningAI.gameFinished(board, gameWinner)
      }
    } else if (gameDraw) {
      setGameState("draw")
      setGameStats((prev) => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        draws: prev.draws + 1,
      }))

      // AI learning update for draw
      if (gameMode === "ai" && prevBoard && lastAIMove !== null) {
        qLearningAI.updateQValue(prevBoard, lastAIMove, board, 0)
        qLearningAI.gameFinished(board, null)
      }
    }
  }, [board, gameMode, prevBoard, lastAIMove, findWinningCells])

  useEffect(() => {
    updateGameState()
  }, [updateGameState])

  // AI move logic
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "O" && gameState === "playing") {
      setIsAIThinking(true)

      const timer = setTimeout(() => {
        const aiMove = qLearningAI.getBestMove(board)
        if (aiMove !== -1) {
          setPrevBoard([...board])
          setLastAIMove(aiMove)
          makeMove(aiMove, "O")
        }
        setIsAIThinking(false)
      }, 800) // Longer delay to show AI thinking

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, gameState, board])

  const makeMove = (index: number, player: Cell) => {
    if (board[index] !== null || gameState !== "playing") return

    const newBoard = [...board]
    newBoard[index] = player
    setBoard(newBoard)
    setCurrentPlayer(player === "X" ? "O" : "X")

    // Update Q-values for intermediate moves
    if (gameMode === "ai" && player === "O" && prevBoard && lastAIMove !== null) {
      const reward = 0 // Intermediate reward
      qLearningAI.updateQValue(prevBoard, lastAIMove, newBoard, reward)
    }
  }

  const handleCellClick = (index: number) => {
    if (gameMode === "friend") {
      makeMove(index, currentPlayer)
    } else if (gameMode === "ai" && currentPlayer === "X" && !isAIThinking) {
      makeMove(index, "X")
    }
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer("X")
    setWinner(null)
    setGameState("playing")
    setWinningCells([])
    setIsAIThinking(false)
    setPrevBoard(null)
    setLastAIMove(null)
  }

  const startNewGame = (mode: GameMode) => {
    setGameMode(mode)
    resetGame()
  }

  const resetAI = () => {
    qLearningAI.reset()
    setGameStats({
      playerWins: 0,
      aiWins: 0,
      draws: 0,
      totalGames: 0,
    })
  }

  const getStatusMessage = () => {
    if (isAIThinking) return "🤖 AI is thinking..."
    if (winner) return `🎉 ${winner === "X" ? "You win!" : winner === "O" ? "AI wins!" : "Winner!"}`
    if (gameState === "draw") return "🤝 It's a draw!"
    if (gameMode === "friend") return `Player ${currentPlayer}'s turn`
    if (gameMode === "ai") return currentPlayer === "X" ? "Your turn" : "AI's turn"
    return ""
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tic-Tac-Toe ML
            </CardTitle>
            <p className="text-gray-600 mt-2">Experience AI that learns as you play</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <Button
              onClick={() => startNewGame("ai")}
              className="w-full h-16 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              🤖 Challenge the AI
              <Badge variant="secondary" className="ml-2">
                Q-Learning
              </Badge>
            </Button>
            <Button onClick={() => startNewGame("friend")} className="w-full h-16 text-lg" variant="outline">
              👥 Play with Friend
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Tic-Tac-Toe ML
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant={gameMode === "ai" ? "default" : "outline"} className="text-lg px-4 py-2">
              {gameMode === "ai" ? "🤖 vs Q-Learning AI" : "👥 vs Friend"}
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-gray-700">{getStatusMessage()}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <Board
                  board={board}
                  onCellClick={handleCellClick}
                  disabled={gameState !== "playing" || isAIThinking || (gameMode === "ai" && currentPlayer === "O")}
                  winningCells={winningCells}
                />

                <div className="flex gap-4 mt-8 justify-center">
                  <Button onClick={resetGame} variant="outline" size="lg">
                    🔄 New Game
                  </Button>
                  <Button onClick={() => setGameMode(null)} variant="outline" size="lg">
                    🏠 Main Menu
                  </Button>
                  {gameMode === "ai" && (
                    <Button onClick={resetAI} variant="destructive" size="lg">
                      🧠 Reset AI
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Game Stats */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>📊 Game Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{gameStats.playerWins}</div>
                      <div className="text-sm text-gray-600">Your Wins</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{gameStats.draws}</div>
                      <div className="text-sm text-gray-600">Draws</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{gameStats.aiWins}</div>
                      <div className="text-sm text-gray-600">AI Wins</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">Total Games: {gameStats.totalGames}</div>
                    {gameStats.totalGames > 0 && (
                      <div className="text-sm text-gray-600">
                        Win Rate: {((gameStats.playerWins / gameStats.totalGames) * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Stats */}
            {gameMode === "ai" && <AIStats stats={qLearningAI.getStats()} />}

            {/* How it Works */}
            {gameMode === "ai" && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>🧠 How Q-Learning Works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Exploration:</strong> AI tries random moves to discover new strategies
                  </p>
                  <p>
                    <strong>Learning:</strong> AI updates its knowledge based on game outcomes
                  </p>
                  <p>
                    <strong>Exploitation:</strong> AI uses learned knowledge to make optimal moves
                  </p>
                  <p className="text-xs mt-4 p-3 bg-blue-50 rounded">
                    The AI starts by exploring randomly, then gradually becomes more strategic as it learns from wins
                    and losses.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
