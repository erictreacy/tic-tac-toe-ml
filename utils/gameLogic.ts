export type Player = "X" | "O" | null
export type Board = Player[]
export type GameMode = "ai" | "friend"

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

export function checkWinner(board: Board): Player {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && !checkWinner(board)
}

export function getAvailableMoves(board: Board): number[] {
  return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
}

export function createEmptyBoard(): Board {
  return Array(9).fill(null)
}
