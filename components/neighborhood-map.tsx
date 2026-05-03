"use client"

import { useState, useCallback, useRef, useEffect, type ElementType } from "react"
import {
  Home,
  Briefcase,
  Leaf,
  Sparkles,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  Keyboard,
  Gamepad2,
  MousePointerClick,
} from "lucide-react"

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
  { id: "cliff",       x: 0,  y: 0,  width: 4, height: 6,  type: "rock",     zone: "nature"   },
  { id: "river",       x: 0,  y: 0,  width: 3, height: 10, type: "water",    zone: "nature"   },
  { id: "tree-tl-1",   x: 3,  y: 0,  width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "tree-tl-2",   x: 5,  y: 0,  width: 2, height: 2,  type: "tree",     zone: "nature"   },
  { id: "tree-tl-3",   x: 0,  y: 7,  width: 2, height: 3,  type: "tree",     zone: "nature"   },
  { id: "bridge",      x: 3,  y: 7,  width: 2, height: 2,  type: "bridge",   zone: "neutral"  },
  { id: "rock-n1",     x: 6,  y: 5,  width: 1, height: 1,  type: "rock",     zone: "nature"   },
  { id: "rock-n2",     x: 7,  y: 4,  width: 1, height: 1,  type: "rock",     zone: "nature"   },
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

// ── Zone Definitions ─────────────────────────────────────────────────────────
type ZoneId = "nature" | "home" | "business" | "abstract" | "faq"

interface ZoneOption {
  label: string
  description: string
}

interface Zone {
  id: ZoneId
  label: string
  title: string
  subtitle: string
  icon: ElementType
  color: string
  bgColor: string
  // Label position on the map (in grid coordinates, x and y)
  labelX: number
  labelY: number
  // Trigger cell - where Piggy needs to be (or near) to interact
  triggerX: number
  triggerY: number
  options: ZoneOption[]
}

const ZONES: Zone[] = [
  {
    id: "nature",
    label: "NATURE",
    title: "Naturaleza",
    subtitle: "Ahorro y crecimiento",
    icon: Leaf,
    color: "#16a34a",
    bgColor: "#dcfce7",
    labelX: 4,
    labelY: 5,
    triggerX: 5,
    triggerY: 7,
    options: [
      { label: "Ahorro", description: "Aprende a guardar tus monedas para el futuro" },
      { label: "Inversión", description: "Haz que tus ahorros crezcan con el tiempo" },
      { label: "Crecimiento", description: "Hábitos diarios para construir riqueza" },
    ],
  },
  {
    id: "home",
    label: "HOME",
    title: "Hogar",
    subtitle: "Hábitos y rutina",
    icon: Home,
    color: "#ea580c",
    bgColor: "#ffedd5",
    labelX: 18,
    labelY: 6,
    triggerX: 15,
    triggerY: 7,
    options: [
      { label: "Hábitos", description: "Construye rutinas que mejoren tu vida" },
      { label: "Rutina", description: "Organiza tu día para ser más efectivo" },
      { label: "Organización", description: "Mantén tu espacio y mente en orden" },
    ],
  },
  {
    id: "business",
    label: "BUSINESS",
    title: "Negocios",
    subtitle: "Producto y productividad",
    icon: Briefcase,
    color: "#2563eb",
    bgColor: "#dbeafe",
    labelX: 4,
    labelY: 16,
    triggerX: 6,
    triggerY: 9,
    options: [
      { label: "Producto", description: "Crea soluciones que la gente necesita" },
      { label: "Decisiones", description: "Toma decisiones inteligentes y rápidas" },
      { label: "Productividad", description: "Maximiza tu rendimiento diario" },
    ],
  },
  {
    id: "abstract",
    label: "ABSTRACT",
    title: "Abstracto",
    subtitle: "Ideas y desafíos",
    icon: Sparkles,
    color: "#9333ea",
    bgColor: "#f3e8ff",
    labelX: 19,
    labelY: 16,
    triggerX: 14,
    triggerY: 10,
    options: [
      { label: "Ideas", description: "Explora conceptos y pensamientos creativos" },
      { label: "Estados", description: "Comprende tus emociones y mentalidad" },
      { label: "Desafíos", description: "Supera retos que pondrán a prueba tu mente" },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    title: "¿Cómo se juega?",
    subtitle: "Guía y controles",
    icon: HelpCircle,
    color: "#d97706",
    bgColor: "#fef3c7",
    labelX: 11,
    labelY: 13,
    triggerX: 11,
    triggerY: 8,
    options: [
      { label: "Movimiento", description: "Usa WASD, flechas o el joystick virtual para mover a Piggy" },
      { label: "Interacción", description: "Acércate a una zona y presiona E o haz click en la etiqueta" },
      { label: "Objetivo", description: "Explora cada zona del mapa y aprende sus lecciones únicas" },
    ],
  },
]

// Manhattan distance between two grid cells
const manhattanDist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

// ── Character Sprite Component ───────────────────────────────────────────────
const SPRITE_SIZE = 100

const ALL_SPRITES = {
  down: "/sprites/front-1.png",
  up: "/sprites/back-1.png",
  left: "/sprites/left-1.png",
  right: "/sprites/right-1.png",
} as const

function CharacterSprite({
  direction,
  isMoving,
}: {
  direction: "up" | "down" | "left" | "right"
  isMoving: boolean
}) {
  return (
    <div
      style={{
        width: `${SPRITE_SIZE}px`,
        height: `${SPRITE_SIZE}px`,
        position: "relative",
        animation: isMoving ? "walk-bounce 0.3s ease-in-out infinite" : "none",
      }}
    >
      {(Object.keys(ALL_SPRITES) as Array<keyof typeof ALL_SPRITES>).map((dir) => (
        <img
          key={dir}
          src={ALL_SPRITES[dir] || "/placeholder.svg"}
          alt="Piggy"
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
            userSelect: "none",
            opacity: dir === direction ? 1 : 0,
          }}
        />
      ))}
    </div>
  )
}

// ── Zone Marker (label on the map) ───────────────────────────────────────────
function ZoneMarker({
  zone,
  isNear,
  onClick,
}: {
  zone: Zone
  isNear: boolean
  onClick: () => void
}) {
  const Icon = zone.icon
  const cellW = 100 / GRID_COLS
  const cellH = 100 / GRID_ROWS

  return (
    <button
      onClick={onClick}
      className="absolute z-20 pointer-events-auto group cursor-pointer"
      style={{
        left: `${zone.labelX * cellW + cellW / 2}%`,
        top: `${zone.labelY * cellH + cellH / 2}%`,
        transform: "translate(-50%, -50%)",
      }}
      aria-label={`Entrar a ${zone.title}`}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg transition-all duration-200 group-hover:scale-110 group-active:scale-95 backdrop-blur-sm font-bold text-xs whitespace-nowrap"
        style={{
          background: isNear ? zone.color : "rgba(255,255,255,0.92)",
          color: isNear ? "#ffffff" : zone.color,
          border: `2px solid ${zone.color}`,
          boxShadow: isNear
            ? `0 0 0 4px ${zone.color}33, 0 4px 14px ${zone.color}66`
            : `0 2px 8px rgba(0,0,0,0.2)`,
          animation: isNear ? "marker-pulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{zone.label}</span>
      </div>
      {isNear && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
          style={{
            top: "100%",
            background: zone.color,
            color: "#ffffff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          Press E
        </div>
      )}
    </button>
  )
}

// ── Zone Modal ───────────────────────────────────────────────────────────────
function ZoneModal({ zone, onClose }: { zone: Zone; onClose: () => void }) {
  const Icon = zone.icon

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const isFAQ = zone.id === "faq"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 flex items-start gap-3"
          style={{ background: zone.bgColor, borderBottom: `3px solid ${zone.color}` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{ background: zone.color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold leading-tight" style={{ color: zone.color }}>
              {zone.title}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: zone.color, opacity: 0.85 }}>
              {zone.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-black/10"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" style={{ color: zone.color }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {isFAQ && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: zone.bgColor }}>
              <div className="flex items-center gap-3 mb-2">
                <Keyboard className="w-4 h-4" style={{ color: zone.color }} />
                <span className="text-xs font-bold" style={{ color: zone.color }}>
                  Teclado: WASD o flechas
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-4 h-4" style={{ color: zone.color }} />
                <span className="text-xs font-bold" style={{ color: zone.color }}>
                  Joystick virtual abajo a la izquierda
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MousePointerClick className="w-4 h-4" style={{ color: zone.color }} />
                <span className="text-xs font-bold" style={{ color: zone.color }}>
                  Click en una etiqueta para entrar
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {zone.options.map((option) => (
              <div
                key={option.label}
                className="p-3 rounded-xl transition-colors hover:bg-black/5 cursor-pointer"
                style={{
                  border: `1.5px solid ${zone.color}33`,
                  background: "#fafafa",
                }}
              >
                <div className="font-bold text-sm mb-0.5" style={{ color: zone.color }}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-600 leading-snug">{option.description}</div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: zone.color }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function NeighborhoodMap() {
  const [grid] = useState<CellType[][]>(initializeGrid)
  const [showPaths, setShowPaths] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  const [piggyPos, setPiggyPos] = useState({ x: 12, y: 9 })
  const [piggyDirection, setPiggyDirection] = useState<"down" | "up" | "left" | "right">("down")
  const [isMoving, setIsMoving] = useState(false)
  const [activeZone, setActiveZone] = useState<Zone | null>(null)
  const joystickRef = useRef<HTMLDivElement>(null)
  const [joystickActive, setJoystickActive] = useState(false)
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCellHover = useCallback((x: number, y: number) => setHoveredCell({ x, y }), [])
  const handleCellLeave = useCallback(() => setHoveredCell(null), [])

  const triggerWalkAnimation = useCallback(() => {
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    setIsMoving(true)
    moveTimeoutRef.current = setTimeout(() => {
      setIsMoving(false)
    }, 350)
  }, [])

  const movePiggy = useCallback(
    (dx: number, dy: number, dir: "down" | "up" | "left" | "right") => {
      setPiggyDirection(dir)
      setPiggyPos((prev) => {
        const newX = prev.x + dx
        const newY = prev.y + dy
        if (isWalkable(newX, newY, grid)) {
          triggerWalkAnimation()
          return { x: newX, y: newY }
        }
        return prev
      })
    },
    [grid, triggerWalkAnimation]
  )

  // Determine the closest zone Piggy is near (within 2 cells)
  const nearestZone = (() => {
    let closest: Zone | null = null
    let minDist = Infinity
    for (const z of ZONES) {
      const d = manhattanDist(piggyPos, { x: z.triggerX, y: z.triggerY })
      if (d <= 2 && d < minDist) {
        minDist = d
        closest = z
      }
    }
    return closest
  })()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // If a modal is open, ignore movement keys
      if (activeZone) return

      const key = e.key.toLowerCase()
      switch (key) {
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
        case "e":
        case "enter":
          if (nearestZone) {
            setActiveZone(nearestZone)
            e.preventDefault()
          }
          break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiggy, nearestZone, activeZone])

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    }
  }, [])

  const handleJoystickStart = useCallback(() => {
    setJoystickActive(true)
  }, [])

  const handleJoystickMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!joystickRef.current || !joystickActive) return

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const x = e.clientX - rect.left - centerX
      const y = e.clientY - rect.top - centerY
      const distance = Math.sqrt(x * x + y * y)

      if (distance > 5) {
        const angle = Math.atan2(y, x)
        let dir: "down" | "up" | "left" | "right" | null = null

        if (angle > -Math.PI / 4 && angle < Math.PI / 4) dir = "right"
        else if (angle > Math.PI / 4 && angle < (3 * Math.PI) / 4) dir = "down"
        else if (angle < -Math.PI / 4 && angle > -(3 * Math.PI) / 4) dir = "up"
        else dir = "left"

        if (dir) {
          const dx = dir === "right" ? 1 : dir === "left" ? -1 : 0
          const dy = dir === "down" ? 1 : dir === "up" ? -1 : 0
          movePiggy(dx, dy, dir)
        }
      }
    },
    [joystickActive, movePiggy]
  )

  const handleJoystickEnd = useCallback(() => {
    setJoystickActive(false)
  }, [])

  const cellW = 100 / GRID_COLS
  const cellH = 100 / GRID_ROWS

  const piggyScreenX = piggyPos.x * cellW + cellW / 2
  const piggyScreenY = piggyPos.y * cellH + cellH / 2

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-900 flex items-center justify-center">
      {/* Background image */}
      <img
        src="/neighborhood-background.png"
        alt="Mapa del vecindario"
        className="w-full h-full"
        style={{
          objectFit: "contain",
          objectPosition: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />

      {/* Hit-test grid */}
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

      {/* Zone markers - positioned over each building */}
      {ZONES.map((zone) => (
        <ZoneMarker
          key={zone.id}
          zone={zone}
          isNear={nearestZone?.id === zone.id}
          onClick={() => setActiveZone(zone)}
        />
      ))}

      {/* Piggy character */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          left: `${piggyScreenX}%`,
          top: `${piggyScreenY}%`,
          transform: "translate(-50%, -62%)",
          transition: "left 0.12s linear, top 0.12s linear",
        }}
      >
        <CharacterSprite direction={piggyDirection} isMoving={isMoving} />
      </div>

      {/* Bottom-right: controls hint + path toggle */}
      <div className="absolute bottom-3 right-3 z-40 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm text-center"
          style={{
            background: "rgba(255,255,255,0.90)",
            color: "#4a3500",
            border: "1.5px solid rgba(0,0,0,0.12)",
          }}
        >
          WASD/flechas · E para entrar
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

      {/* Bottom-left: virtual joystick */}
      <div
        ref={joystickRef}
        className="absolute bottom-4 left-4 z-40 w-32 h-32 rounded-full pointer-events-auto touch-none select-none"
        style={{
          background: joystickActive ? "rgba(100, 150, 255, 0.15)" : "rgba(100, 100, 100, 0.08)",
          border: "2px dashed rgba(100, 100, 100, 0.3)",
          cursor: "grab",
          userSelect: "none",
        }}
        onPointerDown={handleJoystickStart}
        onPointerMove={handleJoystickMove}
        onPointerUp={handleJoystickEnd}
        onPointerLeave={handleJoystickEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent" />
        </div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-40" />
      </div>

      {/* Active zone modal */}
      {activeZone && <ZoneModal zone={activeZone} onClose={() => setActiveZone(null)} />}
    </div>
  )
}
