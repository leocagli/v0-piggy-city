"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Home, Briefcase, Leaf, Sparkles, ChevronDown, Map, Eye, EyeOff } from "lucide-react"

const GRID_COLS = 24
const GRID_ROWS = 18
const CELL_SIZE = 56

type CellType = "grass" | "path" | "water" | "object"

interface MapObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: "house" | "building" | "tree" | "fountain" | "portal" | "bridge" | "rock" | "water"
  label?: string
  zone: "nature" | "home" | "business" | "abstract" | "neutral"
}

// All obstacle objects matching the actual image layout
const mapObjects: MapObject[] = [
  // --- NATURE ZONE (top-left) ---
  // Waterfall / rocky cliff area
  { id: "cliff", x: 0, y: 0, width: 4, height: 6, type: "rock", zone: "nature" },
  // River
  { id: "river", x: 0, y: 0, width: 3, height: 10, type: "water", zone: "nature" },
  // Dense trees top-left
  { id: "tree-tl-1", x: 3, y: 0, width: 2, height: 2, type: "tree", zone: "nature" },
  { id: "tree-tl-2", x: 5, y: 0, width: 2, height: 2, type: "tree", zone: "nature" },
  { id: "tree-tl-3", x: 0, y: 7, width: 2, height: 3, type: "tree", zone: "nature" },
  // Wooden bridge over river
  { id: "bridge", x: 3, y: 7, width: 2, height: 2, type: "bridge", zone: "neutral" },
  // Bushes / rocks in nature
  { id: "rock-n1", x: 6, y: 5, width: 1, height: 1, type: "rock", zone: "nature" },
  { id: "rock-n2", x: 7, y: 4, width: 1, height: 1, type: "rock", zone: "nature" },

  // --- HOME ZONE (top-right) ---
  // Main house
  { id: "house-main", x: 15, y: 1, width: 5, height: 4, type: "house", zone: "home", label: "Casa Principal" },
  // Side shed/annex
  { id: "house-shed", x: 19, y: 3, width: 3, height: 3, type: "house", zone: "home", label: "Anexo" },
  // Fence area
  { id: "fence-1", x: 14, y: 4, width: 1, height: 3, type: "rock", zone: "home" },
  { id: "fence-2", x: 15, y: 6, width: 6, height: 1, type: "rock", zone: "home" },
  // Trees top-right
  { id: "tree-tr-1", x: 21, y: 0, width: 3, height: 3, type: "tree", zone: "home" },
  { id: "tree-tr-2", x: 22, y: 3, width: 2, height: 2, type: "tree", zone: "home" },

  // --- Map board (center-top) ---
  { id: "mapboard", x: 10, y: 3, width: 3, height: 2, type: "rock", zone: "neutral" },

  // --- BUSINESS ZONE (bottom-left) ---
  // Main building
  { id: "building-main", x: 1, y: 10, width: 6, height: 5, type: "building", zone: "business", label: "Edificio Negocios" },
  // Street lamp left
  { id: "lamp-b1", x: 0, y: 10, width: 1, height: 1, type: "rock", zone: "business" },
  { id: "lamp-b2", x: 7, y: 10, width: 1, height: 1, type: "rock", zone: "business" },
  // Trees around business
  { id: "tree-b1", x: 0, y: 13, width: 1, height: 2, type: "tree", zone: "business" },
  { id: "tree-b2", x: 7, y: 13, width: 1, height: 2, type: "tree", zone: "business" },
  // Bottom trees left
  { id: "tree-bl-1", x: 0, y: 15, width: 3, height: 3, type: "tree", zone: "nature" },
  { id: "tree-bl-2", x: 3, y: 16, width: 2, height: 2, type: "tree", zone: "nature" },

  // --- CENTER ---
  // Fountain
  { id: "fountain", x: 10, y: 9, width: 3, height: 3, type: "fountain", zone: "neutral", label: "Fuente" },
  // Signpost
  { id: "sign", x: 11, y: 12, width: 2, height: 2, type: "rock", zone: "neutral" },
  // Lamp posts center
  { id: "lamp-c1", x: 8, y: 8, width: 1, height: 1, type: "rock", zone: "neutral" },
  { id: "lamp-c2", x: 14, y: 8, width: 1, height: 1, type: "rock", zone: "neutral" },

  // --- ABSTRACT ZONE (bottom-right) ---
  // Portal / arch
  { id: "portal", x: 17, y: 9, width: 3, height: 4, type: "portal", zone: "abstract", label: "Portal" },
  // Star pedestal
  { id: "pedestal", x: 15, y: 9, width: 2, height: 2, type: "rock", zone: "abstract" },
  // Colored blocks
  { id: "block-1", x: 15, y: 12, width: 1, height: 1, type: "rock", zone: "abstract" },
  { id: "block-2", x: 16, y: 13, width: 1, height: 1, type: "rock", zone: "abstract" },
  { id: "block-3", x: 20, y: 11, width: 1, height: 1, type: "rock", zone: "abstract" },
  { id: "block-4", x: 21, y: 12, width: 1, height: 1, type: "rock", zone: "abstract" },
  // Pink trees / bushes right side
  { id: "tree-br-1", x: 20, y: 7, width: 2, height: 3, type: "tree", zone: "abstract" },
  { id: "tree-br-2", x: 22, y: 9, width: 2, height: 4, type: "tree", zone: "abstract" },
  { id: "tree-br-3", x: 20, y: 14, width: 4, height: 4, type: "tree", zone: "abstract" },

  // --- Bottom center stairs/path ---
  { id: "stairs", x: 10, y: 16, width: 3, height: 2, type: "bridge", zone: "neutral" },

  // Top border trees
  { id: "tree-top-1", x: 7, y: 0, width: 2, height: 2, type: "tree", zone: "nature" },
  { id: "tree-top-2", x: 9, y: 0, width: 2, height: 2, type: "tree", zone: "nature" },
  { id: "tree-top-3", x: 12, y: 0, width: 2, height: 2, type: "tree", zone: "home" },
  { id: "tree-top-4", x: 14, y: 0, width: 2, height: 2, type: "tree", zone: "home" },
]

const initializeGrid = (): CellType[][] => {
  const grid: CellType[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => "grass" as CellType)
  )

  // River (left edge)
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 3; x++) {
      grid[y][x] = "water"
    }
  }

  // Main horizontal path (center band)
  for (let x = 3; x < GRID_COLS - 2; x++) {
    grid[8][x] = "path"
    grid[9][x] = "path"
  }

  // Main vertical path (center column)
  for (let y = 1; y < GRID_ROWS - 1; y++) {
    grid[y][10] = "path"
    grid[y][11] = "path"
    grid[y][12] = "path"
  }

  // Top path to home zone
  for (let x = 10; x < 16; x++) {
    grid[1][x] = "path"
    grid[2][x] = "path"
  }

  // Path to nature zone (top-left branch)
  for (let y = 5; y < 9; y++) {
    grid[y][5] = "path"
    grid[y][6] = "path"
  }

  // Path to business zone (bottom-left branch)
  for (let y = 9; y < 14; y++) {
    grid[y][7] = "path"
    grid[y][8] = "path"
  }

  // Path to abstract zone (bottom-right branch)
  for (let y = 9; y < 14; y++) {
    grid[y][13] = "path"
    grid[y][14] = "path"
  }

  // Bottom exit path
  for (let x = 9; x < 14; x++) {
    grid[15][x] = "path"
    grid[16][x] = "path"
    grid[17][x] = "path"
  }

  // Mark objects as non-walkable
  for (const obj of mapObjects) {
    for (let dy = 0; dy < obj.height; dy++) {
      for (let dx = 0; dx < obj.width; dx++) {
        const gx = obj.x + dx
        const gy = obj.y + dy
        if (gy < GRID_ROWS && gx < GRID_COLS) {
          if (obj.type !== "bridge") {
            grid[gy][gx] = "object"
          }
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

// Zones info
const zones = [
  { id: "nature", label: "NATURE", desc: "Ahorro y crecimiento", color: "#4ade80", icon: Leaf },
  { id: "home", label: "HOME", desc: "Hábitos y rutina", color: "#fb923c", icon: Home },
  { id: "business", label: "BUSINESS", desc: "Producto y decisiones", color: "#60a5fa", icon: Briefcase },
  { id: "abstract", label: "ABSTRACT", desc: "Ideas y desafíos", color: "#c084fc", icon: Sparkles },
]

// Dropdown component
function Dropdown({
  label,
  icon: Icon,
  color,
  items,
}: {
  label: string
  icon: React.ElementType
  color: string
  items: { label: string; value: string }[]
}) {
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.92)",
          border: `2px solid ${color}`,
          color: "#2d2d2d",
        }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
        <span style={{ color }}>{label}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ color, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 left-0 w-48 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.97)", border: `2px solid ${color}` }}
        >
          {items.map((item) => (
            <button
              key={item.value}
              className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
              onClick={() => {
                setSelected(item.value)
                setOpen(false)
              }}
            >
              {selected === item.value ? "✓ " : ""}{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function NeighborhoodMap() {
  const [grid] = useState<CellType[][]>(initializeGrid)
  const [showPaths, setShowPaths] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)

  const handleCellHover = useCallback((x: number, y: number) => {
    setHoveredCell({ x, y })
  }, [])
  const handleCellLeave = useCallback(() => setHoveredCell(null), [])

  const mapWidth = GRID_COLS * CELL_SIZE
  const mapHeight = GRID_ROWS * CELL_SIZE

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/neighborhood-background.png)",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Invisible grid overlay — fills the entire screen scaled to image */}
      <div
        className="absolute inset-0"
        style={{ cursor: "crosshair" }}
      >
        <div
          className="absolute"
          style={{
            width: mapWidth,
            height: mapHeight,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const walkable = isWalkable(x, y, grid)
              const isHovered = hoveredCell?.x === x && hoveredCell?.y === y
              const isPath = cell === "path"

              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute"
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor:
                      showPaths && isPath
                        ? "rgba(255, 220, 100, 0.25)"
                        : isHovered && showPaths
                        ? walkable
                          ? "rgba(100, 255, 100, 0.2)"
                          : "rgba(255, 80, 80, 0.2)"
                        : "transparent",
                    outline:
                      showPaths && isPath
                        ? "1px solid rgba(200,160,60,0.4)"
                        : "none",
                  }}
                  onMouseEnter={() => handleCellHover(x, y)}
                  onMouseLeave={handleCellLeave}
                />
              )
            })
          )}
        </div>
      </div>

      {/* --- FLOATING UI --- */}

      {/* Top-left: Zone dropdowns */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-40">
        <Dropdown
          label="NATURE"
          icon={Leaf}
          color="#22c55e"
          items={[
            { label: "Ahorro", value: "ahorro" },
            { label: "Inversión", value: "inversion" },
            { label: "Crecimiento", value: "crecimiento" },
          ]}
        />
        <Dropdown
          label="BUSINESS"
          icon={Briefcase}
          color="#3b82f6"
          items={[
            { label: "Producto", value: "producto" },
            { label: "Decisiones", value: "decisiones" },
            { label: "Productividad", value: "productividad" },
          ]}
        />
      </div>

      {/* Top-right: Zone dropdowns */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-40 items-end">
        <Dropdown
          label="HOME"
          icon={Home}
          color="#f97316"
          items={[
            { label: "Hábitos", value: "habitos" },
            { label: "Rutina", value: "rutina" },
            { label: "Organización", value: "organizacion" },
          ]}
        />
        <Dropdown
          label="ABSTRACT"
          icon={Sparkles}
          color="#a855f7"
          items={[
            { label: "Ideas", value: "ideas" },
            { label: "Estados", value: "estados" },
            { label: "Desafíos", value: "desafios" },
          ]}
        />
      </div>

      {/* Bottom-center: toggle caminos */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
        <button
          onClick={() => setShowPaths((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: showPaths ? "rgba(255,220,100,0.95)" : "rgba(255,255,255,0.90)",
            border: "2px solid rgba(180,140,60,0.7)",
            color: "#4a3500",
          }}
        >
          {showPaths ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showPaths ? "Ocultar caminos" : "Mostrar caminos"}
        </button>

        {/* Hover info */}
        {hoveredCell && showPaths && (
          <div
            className="px-3 py-2 rounded-xl text-xs font-medium shadow-xl"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "2px solid rgba(180,140,60,0.5)",
              color: isWalkable(hoveredCell.x, hoveredCell.y, grid) ? "#15803d" : "#dc2626",
            }}
          >
            ({hoveredCell.x}, {hoveredCell.y}) &mdash;{" "}
            {isWalkable(hoveredCell.x, hoveredCell.y, grid) ? "Transitable" : "Bloqueado"}
          </div>
        )}
      </div>

      {/* Map title badge top-center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-xl"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "2px solid rgba(180,140,60,0.6)",
            color: "#4a3500",
          }}
        >
          <Map className="w-4 h-4" />
          Vecindario
        </div>
      </div>
    </div>
  )
}
