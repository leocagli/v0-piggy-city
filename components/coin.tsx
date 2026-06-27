"use client"

import { memo } from "react"

interface CoinProps {
  x: number
  y: number
  cellW: number
  cellH: number
  collected: boolean
}

// Presentational gold-coin sprite (pure SVG). Positioned by grid coords like the
// NPCs / Piggy (cell-centered). Returns null once collected. Memoized so the coin
// list doesn't do work on frames where nothing changed. Keyframes (coin-spin /
// coin-bob) live in globals.css.
export const Coin = memo(function Coin({ x, y, cellW, cellH, collected }: CoinProps) {
  if (collected) return null
  const left = (x + 0.5) * cellW
  const top = (y + 0.5) * cellH
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${cellW * 0.8}%`,
        height: `${cellH * 0.8}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 25, // above grass/NPC art (20), below Piggy (30+)
        animation: "coin-bob 1.4s ease-in-out infinite",
      }}
    >
      <svg
        viewBox="0 0 32 32"
        width="100%"
        height="100%"
        style={{
          display: "block",
          animation: "coin-spin 1.6s linear infinite",
          filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.35))",
        }}
      >
        <circle cx="16" cy="16" r="14" fill="#b45309" />
        <circle cx="16" cy="16" r="12" fill="#f59e0b" />
        <circle cx="16" cy="16" r="9" fill="#fcd34d" />
        <text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="900" fill="#b45309" fontFamily="sans-serif">
          $
        </text>
        <ellipse cx="12" cy="11" rx="3" ry="2" fill="rgba(255,255,255,0.55)" />
      </svg>
    </div>
  )
})
