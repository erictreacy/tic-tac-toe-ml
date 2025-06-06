"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GameBoard } from "./components/GameBoard"
import { GameStats } from "./components/GameStats"
import { type Board, type Player, type GameMode, createEmptyBoard, checkWinner, isDraw } from "./utils/gameLogic"
import { aiPlayer } from "./utils/aiPlayer"

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X")
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [winner, setWinner] = useState<Player>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [playerStats, setPlayerStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
  })

  // Check for game end conditions
  useEffect(() => {
    const gameWinner = checkWinner(board)
    const gameDraw = isDraw(board)

    if (gameWinner || gameDraw) {
      setWinner(gameWinner)
      setIsGameOver(true)

      // Update stats
      if (gameMode === "ai") {
        if (gameWinner === "X") {
          setPlayerStats((prev) => ({ ...prev, wins: prev.wins + 1 }))
        } else if (gameWinner === "O") {
          setPlayerStats((prev) => ({ ...prev, losses: prev.losses + 1 }))
        } else {
          setPlayerStats((prev) => ({ ...prev, draws: prev.draws + 1 }))
        }
      }
    }
  }, [board, gameMode])

  // AI move logic
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "O" && !isGameOver) {
      setIsAiThinking(true)

      // Add delay to make AI thinking visible
      const timer = setTimeout(() => {
        const aiMove = aiPlayer.getBestMove(board)
        if (aiMove !== -1) {
          makeMove(aiMove, "O")
        }
        setIsAiThinking(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, board, isGameOver])

  const makeMove = (index: number, player: Player) => {
    if (board[index] !== null || isGameOver) return

    const newBoard = [...board]
    newBoard[index] = player
    setBoard(newBoard)
    setCurrentPlayer(player === "X" ? "O" : "X")

    // Let AI learn from the move
    if (gameMode === "ai" && player === "O") {
      const gameWinner = checkWinner(newBoard)
      if (gameWinner || isDraw(newBoard)) {
        aiPlayer.learnFromGame(newBoard, gameWinner, index)
      }
    }
  }

  const handleCellClick = (index: number) => {
    if (gameMode === "friend") {
      makeMove(index, currentPlayer)
    } else if (gameMode === "ai" && currentPlayer === "X") {
      makeMove(index, "X")
    }
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer("X")
    setWinner(null)
    setIsGameOver(false)
    setIsAiThinking(false)
  }

  const startNewGame = (mode: GameMode) => {
    setGameMode(mode)
    resetGame()
  }

  const getGameStatus = () => {
    if (isAiThinking) return "AI is thinking..."
    if (winner) return `${winner} wins!`
    if (isDraw(board)) return "It's a draw!"
    if (gameMode === "friend") return `Player ${currentPlayer}'s turn`
    if (gameMode === "ai") return currentPlayer === "X" ? "Your turn" : "AI's turn"
    return ""
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tic-Tac-Toe ML
            </CardTitle>
            <p className="text-gray-600">Choose your game mode</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => startNewGame("ai")} className="w-full h-16 text-lg" variant="default">
              🤖 Play vs AI
              <Badge variant="secondary" className="ml-2">
                Machine Learning
              </Badge>
            </Button>
            <Button onClick={() => startNewGame("friend")} className="w-full h-16 text-lg" variant="outline">
              👥 Play vs Friend
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tic-Tac-Toe ML
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant={gameMode === "ai" ? "default" : "outline"}>
              {gameMode === "ai" ? "🤖 vs AI" : "👥 vs Friend"}
            </Badge>
            <p className="text-lg font-medium">{getGameStatus()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <GameBoard
                board={board}
                onCellClick={handleCellClick}
                disabled={isGameOver || isAiThinking || (gameMode === "ai" && currentPlayer === "O")}
              />

              <div className="flex gap-4 mt-6 justify-center">
                <Button onClick={resetGame} variant="outline">
                  Reset Game
                </Button>
                <Button onClick={() => setGameMode(null)} variant="outline">
                  Change Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          {gameMode === "ai" && (
            <Card>
              <CardHeader>
                <CardTitle>AI Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <GameStats aiStats={aiPlayer.getStats()} playerStats={playerStats} />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong> The AI uses a minimax algorithm combined with machine learning. It
                    starts with some randomness to explore different strategies, then gradually becomes more strategic
                    as it learns from each game.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
