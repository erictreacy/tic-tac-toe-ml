"use client"

import type { Board } from "../utils/gameLogic"

interface GameBoardProps {
  board: Board
  onCellClick: (index: number) => void
  disabled: boolean
}

export function GameBoard({ board, onCellClick, disabled }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => onCellClick(index)}
          disabled={disabled || cell !== null}
          className={`
            w-20 h-20 text-4xl font-bold border-2 border-gray-400 
            hover:bg-gray-100 disabled:cursor-not-allowed
            ${cell === "X" ? "text-blue-600" : cell === "O" ? "text-red-600" : ""}
            ${disabled ? "opacity-50" : ""}
          `}
        >
          {cell}
        </button>
      ))}
    </div>
  )
}
