"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Home, Briefcase, Leaf, Sparkles, ChevronDown, Eye, EyeOff } from "lucide-react"

const GRID_COLS = 24
const GRID_ROWS = 18

type CellType = "grass" | "path" | "water" | "object"

interface MapObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: "house" | "building" | "tree" | "fountain" | "portal" | "bridge" | "rock" | "water"
  zone: "nature" | "home" | "business" | "abstract" | "neutral"
}

const mapObjects: MapObject[] = [
  { id: "cliff",        x: 0,  y: 0,  width: 4, height: 6,  type: "rock",     zone: "nature"   },
  { id: "river",        x: 0,  y: 0,  width: 3, height: 10, type: "water",    zone: "nature"   },
  { id: "tree-tl-1",   x: 3,  y: 0,  width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "tree-tl-2",   x: 5,  y: 0,  width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "tree-tl-3",   x: 0,  y: 7,  width: 2, height: 3,  type: "tree",     zone: "nature"   },
  { id: "bridge",       x: 3,  y: 7,  width: 2, height: 2,  type: "bridge",   zone: "neutral"  },
  { id: "rock-n1",      x: 6,  y: 5,  width: 1, height: 1,  type: "rock",     zone: "nature"   },
  { id: "rock-n2",      x: 7,  y: 4,  width: 1, height: 1,  type: "rock",     zone: "nature"   },
  { id: "house-main",  x: 15, y: 1,  width: 5, height: 4,  type: "house",    zone: "home"     },
  { id: "house-shed",  x: 19, y: 3,  width: 3, height: 3,  type: "house",    zone: "home"     },
  { id: "fence-1",     x: 14, y: 4,  width: 1, height: 3,  type: "rock",     zone: "home"     },
  { id: "fence-2",     x: 15, y: 6,  width: 6, height: 1,  type: "rock",     zone: "home"     },
  { id: "tree-tr-1",   x: 21, y: 0,  width: 3, height: 3,  type: "tree",     zone: "home"     },
  { id: "tree-tr-2",   x: 22, y: 3,  width: 2, height: 2,  type: "tree",     zone: "home"     },
  { id: "mapboard",    x: 10, y: 3,  width: 3, height: 2,  type: "rock",     zone: "neutral"  },
  { id: "building",    x: 1,  y: 10, width: 6, height: 5,  type: "building", zone: "business" },
  { id: "lamp-b1",     x: 0,  y: 10, width: 1, height: 1,  type: "rock",     zone: "business" },
  { id: "lamp-b2",     x: 7,  y: 10, width: 1, height: 1,  type: "rock",     zone: "business" },
  { id: "tree-b1",     x: 0,  y: 13, width: 1, height: 2,  type: "tree",     zone: "business" },
  { id: "tree-b2",     x: 7,  y: 13, width: 1, height: 2,  type: "tree",     zone: "business" },
  { id: "tree-bl-1",   x: 0,  y: 15, width: 3, height: 3,  type: "tree",     zone: "nature"   },
  { id: "tree-bl-2",   x: 3,  y: 16, width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "fountain",    x: 10, y: 9,  width: 3, height: 3,  type: "fountain", zone: "neutral"  },
  { id: "sign",        x: 11, y: 12, width: 2, height: 2,  type: "rock",     zone: "neutral"  },
  { id: "lamp-c1",     x: 8,  y: 8,  width: 1, height: 1,  type: "rock",     zone: "neutral"  },
  { id: "lamp-c2",     x: 14, y: 8,  width: 1, height: 1,  type: "rock",     zone: "neutral"  },
  { id: "portal",      x: 17, y: 9,  width: 3, height: 4,  type: "portal",   zone: "abstract" },
  { id: "pedestal",    x: 15, y: 9,  width: 2, height: 2,  type: "rock",     zone: "abstract" },
  { id: "block-1",     x: 15, y: 12, width: 1, height: 1,  type: "rock",     zone: "abstract" },
  { id: "block-2",     x: 16, y: 13, width: 1, height: 1,  type: "rock",     zone: "abstract" },
  { id: "block-3",     x: 20, y: 11, width: 1, height: 1,  type: "rock",     zone: "abstract" },
  { id: "block-4",     x: 21, y: 12, width: 1, height: 1,  type: "rock",     zone: "abstract" },
  { id: "tree-br-1",   x: 20, y: 7,  width: 2, height: 3,  type: "tree",     zone: "abstract" },
  { id: "tree-br-2",   x: 22, y: 9,  width: 2, height: 4,  type: "tree",     zone: "abstract" },
  { id: "tree-br-3",   x: 20, y: 14, width: 4, height: 4,  type: "tree",     zone: "abstract" },
  { id: "stairs",      x: 10, y: 16, width: 3, height: 2,  type: "bridge",   zone: "neutral"  },
  { id: "tree-top-1",  x: 7,  y: 0,  width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "tree-top-2",  x: 9,  y: 0,  width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "tree-top-3",  x: 12, y: 0,  width: 2, height: 2,  type: "tree",     zone: "home"     },
  { id: "tree-top-4",  x: 14, y: 0,  width: 2, height: 2,  type: "tree",     zone: "home"     },
]

const initializeGrid = (): CellType[][] => {
  const grid: CellType[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => "grass" as CellType)
  )
  for (let y = 0; y < 10; y++) for (let x = 0; x < 3; x++) grid[y][x] = "water"
  for (let x = 3; x < GRID_COLS - 2; x++) { grid[8][x] = "path"; grid[9][x] = "path" }
  for (let y = 1; y < GRID_ROWS - 1; y++) { grid[y][10] = "path"; grid[y][11] = "path"; grid[y][12] = "path" }
  for (let x = 10; x < 16; x++) { grid[1][x] = "path"; grid[2][x] = "path" }
  for (let y = 5; y < 9; y++) { grid[y][5] = "path"; grid[y][6] = "path" }
  for (let y = 9; y < 14; y++) { grid[y][7] = "path"; grid[y][8] = "path" }
  for (let y = 9; y < 14; y++) { grid[y][13] = "path"; grid[y][14] = "path" }
  for (let x = 9; x < 14; x++) { grid[15][x] = "path"; grid[16][x] = "path"; grid[17][x] = "path" }
  for (const obj of mapObjects) {
    for (let dy = 0; dy < obj.height; dy++) {
      for (let dx = 0; dx < obj.width; dx++) {
        const gx = obj.x + dx
        const gy = obj.y + dy
        if (gy < GRID_ROWS && gx < GRID_COLS && obj.type !== "bridge") {
          grid[gy][gx] = "object"
        }
      }
    }
  }
  return grid
}

const isWalkable = (x: number, y: number, grid: CellType[][]): boolean => {
  if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false
  return grid[y][x] === "path"
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
interface DropdownProps {
  label: string
  icon: React.ElementType
  color: string
  align?: "left" | "right"
  items: { label: string; value: string }[]
}

function Dropdown({ label, icon: Icon, color, align = "left", items }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm"
        style={{
          background: "rgba(255,255,255,0.88)",
          border: `2px solid ${color}`,
          color: "#1a1a1a",
        }}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
        <span style={{ color }}>{label}</span>
        <ChevronDown
          className="w-3 h-3 shrink-0 transition-transform duration-200"
          style={{ color, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute mt-1 w-44 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.96)",
            border: `2px solid ${color}`,
            [align === "right" ? "right" : "left"]: 0,
            top: "100%",
          }}
        >
          {items.map((item) => (
            <button
              key={item.value}
              className="w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-black/5 text-gray-700"
              onClick={() => { setSelected(item.value); setOpen(false) }}
            >
              {selected === item.value ? "✓ " : ""}{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function NeighborhoodMap() {
  const [grid] = useState<CellType[][]>(initializeGrid)
  const [showPaths, setShowPaths] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  const [piggyPos, setPiggyPos] = useState({ x: 12, y: 9 })
  const [piggyDirection, setPiggyDirection] = useState<"down" | "up" | "left" | "right">("down")
  const [animationFrame, setAnimationFrame] = useState(0)
  const [isMoving, setIsMoving] = useState(false)

  const handleCellHover = useCallback((x: number, y: number) => setHoveredCell({ x, y }), [])
  const handleCellLeave = useCallback(() => setHoveredCell(null), [])

  const movePiggy = useCallback((dx: number, dy: number, dir: "down" | "up" | "left" | "right") => {
    setPiggyPos((prev) => {
      const newX = prev.x + dx
      const newY = prev.y + dy
      if (isWalkable(newX, newY, grid)) {
        setPiggyDirection(dir)
        setIsMoving(true)
        setAnimationFrame(0)
        return { x: newX, y: newY }
      }
      return prev
    })
  }, [grid])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          movePiggy(0, -1, "up")
          e.preventDefault()
          break
        case "arrowdown":
        case "s":
          movePiggy(0, 1, "down")
          e.preventDefault()
          break
        case "arrowleft":
        case "a":
          movePiggy(-1, 0, "left")
          e.preventDefault()
          break
        case "arrowright":
        case "d":
          movePiggy(1, 0, "right")
          e.preventDefault()
          break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiggy])

  // Animation frame cycling
  useEffect(() => {
    if (!isMoving) return
    const animInterval = setInterval(() => {
      setAnimationFrame((prev) => {
        const next = (prev + 1) % 4
        if (next === 0) setIsMoving(false)
        return next
      })
    }, 150)
    return () => clearInterval(animInterval)
  }, [isMoving])

  // Compute cell percentages so the grid aligns to the image regardless of viewport
  const cellW = 100 / GRID_COLS
  const cellH = 100 / GRID_ROWS

  // Sprite based on direction - use walk animations (4-frame spritesheets)
  const walkAnimationSheet = {
    down: "/piggy-walk-front.png",
    up: "/piggy-walk-back.png",
    left: "/piggy-walk-left.png",
    right: "/piggy-walk-right.png",
  }[piggyDirection]

  // Background position for spritesheet animation (4 frames, each 25% of the image width)
  const bgPositionX = animationFrame * 25

  // Piggy position in screen percentages
  const piggyScreenX = piggyPos.x * cellW + cellW / 2
  const piggyScreenY = piggyPos.y * cellH + cellH / 2

  return (
    // Root: full viewport, no overflow, no margins
    <div className="fixed inset-0 overflow-hidden bg-gray-900 flex items-center justify-center">

      {/* ── Background image — maintains aspect ratio, fully visible ── */}
      <img
        src="/neighborhood-background.png"
        alt="Mapa del vecindario"
        className="w-full h-full"
        style={{ objectFit: "contain", objectPosition: "center", pointerEvents: "none", userSelect: "none" }}
        draggable={false}
      />

      {/* ── Invisible hit-test grid (percentage-based, covers the image exactly) ── */}
      <div
        className="absolute inset-0"
        style={{ cursor: showPaths ? "crosshair" : "default", pointerEvents: "auto" }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const walkable = isWalkable(x, y, grid)
            const isPath = cell === "path"
            const isHovered = hoveredCell?.x === x && hoveredCell?.y === y

            let bg = "transparent"
            if (showPaths && isPath) bg = "rgba(255,215,60,0.22)"
            if (showPaths && isHovered) bg = walkable ? "rgba(80,255,120,0.35)" : "rgba(255,60,60,0.35)"

            return (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * cellW}%`,
                  top: `${y * cellH}%`,
                  width: `${cellW}%`,
                  height: `${cellH}%`,
                  backgroundColor: bg,
                  outline: showPaths && isPath ? "1px solid rgba(200,160,40,0.3)" : "none",
                }}
                onMouseEnter={() => handleCellHover(x, y)}
                onMouseLeave={handleCellLeave}
              />
            )
          })
        )}
      </div>

      {/* ── Piggy — centered focal character over the fountain ── */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          left: `${piggyScreenX}%`,
          top: `${piggyScreenY}%`,
          transform: "translate(-50%, -62%)",
          transition: "left 0.2s ease, top 0.2s ease",
        }}
      >
        <div
          style={{
            width: "clamp(80px, 9vw, 130px)",
            height: "auto",
            backgroundImage: `url(${walkAnimationSheet})`,
            backgroundSize: "400% 100%",
            backgroundPosition: `${bgPositionX}% 0%`,
            aspectRatio: "1",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            WebkitImageRendering: "pixelated",
            filter: "image-rendering: pixelated",
          }}
        />
      </div>

      {/* ══ FLOATING UI — corners only, no center obstruction ══ */}

      {/* Top-left: Nature + Business */}
      <div className="absolute top-3 left-3 z-40 flex flex-col gap-1.5 pointer-events-auto">
        <Dropdown
          label="NATURE"
          icon={Leaf}
          color="#16a34a"
          align="left"
          items={[
            { label: "Ahorro", value: "ahorro" },
            { label: "Inversión", value: "inversion" },
            { label: "Crecimiento", value: "crecimiento" },
          ]}
        />
        <Dropdown
          label="BUSINESS"
          icon={Briefcase}
          color="#2563eb"
          align="left"
          items={[
            { label: "Producto", value: "producto" },
            { label: "Decisiones", value: "decisiones" },
            { label: "Productividad", value: "productividad" },
          ]}
        />
      </div>

      {/* Top-right: Home + Abstract */}
      <div className="absolute top-3 right-3 z-40 flex flex-col gap-1.5 items-end pointer-events-auto">
        <Dropdown
          label="HOME"
          icon={Home}
          color="#ea580c"
          align="right"
          items={[
            { label: "Hábitos", value: "habitos" },
            { label: "Rutina", value: "rutina" },
            { label: "Organización", value: "organizacion" },
          ]}
        />
        <Dropdown
          label="ABSTRACT"
          icon={Sparkles}
          color="#9333ea"
          align="right"
          items={[
            { label: "Ideas", value: "ideas" },
            { label: "Estados", value: "estados" },
            { label: "Desafíos", value: "desafios" },
          ]}
        />
      </div>

      {/* Bottom-right: toggle caminos + hover info + controls */}
      <div className="absolute bottom-3 right-3 z-40 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm text-center"
          style={{
            background: "rgba(255,255,255,0.90)",
            color: "#4a3500",
            border: "1.5px solid rgba(0,0,0,0.12)",
          }}
        >
          Usa WASD o flechas para mover
        </div>
        {showPaths && hoveredCell && (
          <div
            className="px-2.5 py-1 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm"
            style={{
              background: "rgba(255,255,255,0.90)",
              color: isWalkable(hoveredCell.x, hoveredCell.y, grid) ? "#15803d" : "#dc2626",
              border: "1.5px solid rgba(0,0,0,0.12)",
            }}
          >
            ({hoveredCell.x}, {hoveredCell.y}) —{" "}
            {isWalkable(hoveredCell.x, hoveredCell.y, grid) ? "Transitable" : "Bloqueado"}
          </div>
        )}
        <button
          onClick={() => setShowPaths((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 backdrop-blur-sm"
          style={{
            background: showPaths ? "rgba(255,215,60,0.92)" : "rgba(255,255,255,0.88)",
            border: "2px solid rgba(160,120,40,0.6)",
            color: "#4a3500",
          }}
        >
          {showPaths ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showPaths ? "Ocultar caminos" : "Caminos"}
        </button>
      </div>
    </div>
  )
}
