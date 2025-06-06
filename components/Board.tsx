"use client"

import type { Board as BoardType } from "../types/game"

interface BoardProps {
  board: BoardType
  onCellClick: (index: number) => void
  disabled: boolean
  winningCells?: number[]
}

export function Board({ board, onCellClick, disabled, winningCells = [] }: BoardProps) {
  return (
    <div className="relative">
      {/* Bauhaus geometric background elements */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500 rotate-45"></div>
      <div className="absolute -top-2 -right-6 w-6 h-6 bg-yellow-400 rounded-full"></div>
      <div className="absolute -bottom-4 -right-4 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-blue-600"></div>

      <div className="grid grid-cols-3 gap-1 w-80 h-80 mx-auto bg-black p-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={disabled || cell !== null}
            className={`
              relative w-full h-full font-black text-5xl transition-all duration-200
              ${cell === "X" ? "bg-blue-600 text-white" : ""}
              ${cell === "O" ? "bg-red-500 text-white" : ""}
              ${cell === null ? "bg-white hover:bg-yellow-100" : ""}
              ${winningCells.includes(index) ? "ring-4 ring-yellow-400" : ""}
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              font-mono
            `}
          >
            {cell && <span className="absolute inset-0 flex items-center justify-center">{cell}</span>}
            {/* Bauhaus corner elements */}
            {cell === null && !disabled && (
              <>
                <div className="absolute top-0 left-0 w-2 h-2 bg-black"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-black"></div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
