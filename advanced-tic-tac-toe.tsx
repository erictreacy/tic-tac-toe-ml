"use client"

import { useState, useEffect, useCallback } from "react"
import { Board } from "./components/Board"
import { AdvancedStats } from "./components/AdvancedStats"
import { advancedAI } from "./ai/advanced-ai"

type Cell = "X" | "O" | null
type BoardType = Cell[]
type GameMode = "ai" | "friend"

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
]

export default function AdvancedTicTacToe() {
  const [board, setBoard] = useState<BoardType>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Cell>("X")
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [gameState, setGameState] = useState<"playing" | "won" | "draw">("playing")
  const [winner, setWinner] = useState<Cell>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [winningCells, setWinningCells] = useState<number[]>([])
  const [gameStats, setGameStats] = useState({
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    totalGames: 0,
  })
  const [aiStats, setAiStats] = useState(advancedAI.getAdvancedStats())

  // Update AI stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAiStats(advancedAI.getAdvancedStats())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const checkWinner = useCallback((board: BoardType): Cell => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }, [])

  const isDraw = useCallback(
    (board: BoardType): boolean => {
      return board.every((cell) => cell !== null) && !checkWinner(board)
    },
    [checkWinner],
  )

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

      // AI learning
      if (gameMode === "ai") {
        const numericBoard = board.map((cell) => (cell === "X" ? -1 : cell === "O" ? 1 : 0))
        const winnerNumeric = gameWinner === "X" ? -1 : gameWinner === "O" ? 1 : 0
        advancedAI.gameFinished(numericBoard, winnerNumeric)
      }
    } else if (gameDraw) {
      setGameState("draw")
      setGameStats((prev) => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        draws: prev.draws + 1,
      }))

      if (gameMode === "ai") {
        const numericBoard = board.map((cell) => (cell === "X" ? -1 : cell === "O" ? 1 : 0))
        advancedAI.gameFinished(numericBoard, 0)
      }
    }
  }, [board, gameMode, checkWinner, isDraw, findWinningCells])

  useEffect(() => {
    updateGameState()
  }, [updateGameState])

  // AI move logic
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "O" && gameState === "playing") {
      setIsAIThinking(true)

      const timer = setTimeout(() => {
        const aiMove = advancedAI.getBestMove(board)
        if (aiMove !== -1) {
          makeMove(aiMove, "O")
        }
        setIsAIThinking(false)
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, gameState, board])

  const makeMove = (index: number, player: Cell) => {
    if (board[index] !== null || gameState !== "playing") return

    const newBoard = [...board]
    newBoard[index] = player
    setBoard(newBoard)
    setCurrentPlayer(player === "X" ? "O" : "X")

    // Add experience for AI learning
    if (gameMode === "ai" && player === "O") {
      const prevNumericBoard = board.map((cell) => (cell === "X" ? -1 : cell === "O" ? 1 : 0))
      const newNumericBoard = newBoard.map((cell) => (cell === "X" ? -1 : cell === "O" ? 1 : 0))
      const reward = checkWinner(newBoard) === "O" ? 10 : checkWinner(newBoard) === "X" ? -10 : 0
      const done = checkWinner(newBoard) !== null || isDraw(newBoard)

      advancedAI.addExperience(prevNumericBoard, index, reward, newNumericBoard, done)
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
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setGameState("playing")
    setWinningCells([])
    setIsAIThinking(false)
  }

  const startNewGame = (mode: GameMode) => {
    setGameMode(mode)
    resetGame()
  }

  const resetAI = () => {
    advancedAI.reset()
    setGameStats({
      playerWins: 0,
      aiWins: 0,
      draws: 0,
      totalGames: 0,
    })
    setAiStats(advancedAI.getAdvancedStats())
  }

  const getStatusMessage = () => {
    if (isAIThinking) return "AI COMPUTING..."
    if (winner) return `${winner === "X" ? "HUMAN WINS" : "MACHINE WINS"}`
    if (gameState === "draw") return "DRAW GAME"
    if (gameMode === "friend") return `PLAYER ${currentPlayer} TURN`
    if (gameMode === "ai") return currentPlayer === "X" ? "YOUR MOVE" : "AI THINKING"
    return ""
  }

  const getDifficultyLevel = () => {
    const winRate = aiStats.winRate
    if (winRate < 0.3) return { level: "NOVICE", color: "bg-yellow-400", textColor: "text-black" }
    if (winRate < 0.6) return { level: "SKILLED", color: "bg-blue-600", textColor: "text-white" }
    if (winRate < 0.8) return { level: "EXPERT", color: "bg-red-500", textColor: "text-white" }
    return { level: "MASTER", color: "bg-black", textColor: "text-white" }
  }

  if (!gameMode) {
    const difficulty = getDifficultyLevel()

    return (
      <div className="min-h-screen bg-white p-4 relative overflow-hidden">
        {/* Bauhaus Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 rotate-45"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-400 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[70px] border-l-transparent border-r-transparent border-b-blue-600"></div>
        <div className="absolute bottom-10 right-10 w-24 h-6 bg-black"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-lg bg-white border-8 border-black relative">
            {/* Geometric header decoration */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-yellow-400 rounded-full"></div>

            <div className="bg-black text-white p-6 relative">
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-b-[30px] border-l-transparent border-b-red-500"></div>
              <h1 className="text-3xl font-black uppercase tracking-wider text-center">TIC-TAC-TOE</h1>
              <p className="text-center text-gray-300 font-bold uppercase text-sm tracking-wide mt-1">
                MACHINE LEARNING
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Status Display */}
              <div className="bg-gray-100 border-4 border-black p-4 relative">
                <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400"></div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className={`w-6 h-6 ${difficulty.color} border-2 border-black`}></div>
                  <span className="font-black text-lg uppercase tracking-wider">AI LEVEL: {difficulty.level}</span>
                </div>
                <div className="text-center text-sm font-bold uppercase">
                  WIN RATE: {(aiStats.winRate * 100).toFixed(0)}% • GAMES: {aiStats.selfPlayGames}
                </div>
              </div>

              {/* Game Mode Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => startNewGame("ai")}
                  className="w-full h-16 bg-black text-white font-black text-lg uppercase tracking-wider relative hover:bg-gray-800 transition-colors"
                >
                  <div className="absolute top-0 left-0 w-4 h-4 bg-red-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-400"></div>
                  VS MACHINE
                  <div className="flex justify-center gap-2 mt-1">
                    <span className="text-xs bg-blue-600 px-2 py-1">DQN</span>
                    <span className="text-xs bg-red-500 px-2 py-1">MCTS</span>
                    <span className="text-xs bg-yellow-400 text-black px-2 py-1">MINIMAX</span>
                  </div>
                </button>

                <button
                  onClick={() => startNewGame("friend")}
                  className="w-full h-16 bg-white text-black border-4 border-black font-black text-lg uppercase tracking-wider relative hover:bg-gray-100 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-4 h-4 bg-blue-600"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-red-500"></div>
                  VS HUMAN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 relative overflow-hidden">
      {/* Bauhaus Background Elements */}
      <div className="absolute top-5 left-5 w-12 h-12 bg-red-500 rotate-45"></div>
      <div className="absolute top-10 right-10 w-10 h-10 bg-yellow-400 rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-blue-600"></div>
      <div className="absolute bottom-5 right-5 w-16 h-4 bg-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Bauhaus Header */}
        <div className="text-center mb-8 relative">
          <div className="bg-black text-white p-6 border-8 border-black relative">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400"></div>
            <h1 className="text-4xl font-black uppercase tracking-wider">TIC-TAC-TOE ML</h1>

            <div className="flex items-center justify-center gap-4 mt-4">
              <div
                className={`px-4 py-2 font-black uppercase text-sm tracking-wider ${
                  gameMode === "ai" ? "bg-white text-black" : "bg-gray-600 text-white"
                }`}
              >
                {gameMode === "ai" ? "VS MACHINE" : "VS HUMAN"}
              </div>
              {gameMode === "ai" && (
                <div
                  className={`px-3 py-1 font-black uppercase text-xs ${getDifficultyLevel().color} ${getDifficultyLevel().textColor}`}
                >
                  {getDifficultyLevel().level}
                </div>
              )}
            </div>

            <p className="text-xl font-black uppercase mt-4 tracking-wider">{getStatusMessage()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white border-8 border-black relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-red-500"></div>

              <div className="p-8">
                <Board
                  board={board}
                  onCellClick={handleCellClick}
                  disabled={gameState !== "playing" || isAIThinking || (gameMode === "ai" && currentPlayer === "O")}
                  winningCells={winningCells}
                />

                {/* Bauhaus Control Buttons */}
                <div className="flex gap-4 mt-8 justify-center flex-wrap">
                  <button
                    onClick={resetGame}
                    className="bg-white text-black border-4 border-black px-6 py-3 font-black uppercase tracking-wider hover:bg-gray-100 relative"
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 bg-blue-600"></div>
                    NEW GAME
                  </button>
                  <button
                    onClick={() => setGameMode(null)}
                    className="bg-white text-black border-4 border-black px-6 py-3 font-black uppercase tracking-wider hover:bg-gray-100 relative"
                  >
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400"></div>
                    MENU
                  </button>
                  {gameMode === "ai" && (
                    <button
                      onClick={resetAI}
                      className="bg-red-500 text-white border-4 border-black px-6 py-3 font-black uppercase tracking-wider hover:bg-red-600 relative"
                    >
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-400"></div>
                      RESET AI
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Game Stats - Bauhaus Style */}
            <div className="bg-white border-4 border-black relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-red-500"></div>

              <div className="bg-black text-white p-4">
                <h3 className="font-black uppercase tracking-wider">BATTLE STATS</h3>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-600 text-white p-3 relative">
                    <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400"></div>
                    <div className="text-2xl font-black">{gameStats.playerWins}</div>
                    <div className="text-xs font-bold uppercase">YOU</div>
                  </div>
                  <div className="bg-gray-400 text-white p-3 relative">
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-black"></div>
                    <div className="text-2xl font-black">{gameStats.draws}</div>
                    <div className="text-xs font-bold uppercase">DRAW</div>
                  </div>
                  <div className="bg-red-500 text-white p-3 relative">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400"></div>
                    <div className="text-2xl font-black">{gameStats.aiWins}</div>
                    <div className="text-xs font-bold uppercase">AI</div>
                  </div>
                </div>

                <div className="text-center border-t-4 border-black pt-4">
                  <div className="font-black uppercase">TOTAL: {gameStats.totalGames}</div>
                  {gameStats.totalGames > 0 && (
                    <div className="text-sm font-bold">
                      WIN RATE: {((gameStats.playerWins / gameStats.totalGames) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced AI Stats */}
            {gameMode === "ai" && <AdvancedStats stats={aiStats} />}
          </div>
        </div>
      </div>
    </div>
  )
}
