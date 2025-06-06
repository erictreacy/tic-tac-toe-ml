import type { Board, Cell, GameState } from "../types/game"

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
]

export function createEmptyBoard(): Board {
  return Array(9).fill(null)
}

export function checkWinner(board: Board): Cell {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && !checkWinner(board)
}

export function getGameState(board: Board): GameState {
  const winner = checkWinner(board)
  if (winner) return "won"
  if (isDraw(board)) return "draw"
  return "playing"
}

export function getAvailableMoves(board: Board): number[] {
  return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
}
