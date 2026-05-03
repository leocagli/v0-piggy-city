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
  ChevronRight,
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

const BLOCKED_ZONES: { x: number; y: number; w: number; h: number }[] = [
  { x: 0,  y: 0,  w: 3,  h: 11 },
  { x: 1,  y: 10, w: 7,  h: 6  },
  { x: 14, y: 1,  w: 9,  h: 6  },
  { x: 15, y: 8,  w: 9,  h: 8  },
]

const initializeGrid = (): CellType[][] => {
  const grid: CellType[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => "grass" as CellType)
  )
  for (const zone of BLOCKED_ZONES) {
    for (let dy = 0; dy < zone.h; dy++) {
      for (let dx = 0; dx < zone.w; dx++) {
        const gx = zone.x + dx
        const gy = zone.y + dy
        if (gy < GRID_ROWS && gx < GRID_COLS) grid[gy][gx] = "object"
      }
    }
  }
  return grid
}

// Hard boundary — Piggy cannot step outside these limits
// Keeps the character inside the visible drawn map area
const MAP_MIN_X = 3
const MAP_MAX_X = 22
const MAP_MIN_Y = 1
const MAP_MAX_Y = 16

const isWalkable = (x: number, y: number, grid: CellType[][]): boolean => {
  if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false
  // Hard map boundary — stops Piggy at the edge of the drawn art
  if (x < MAP_MIN_X || x > MAP_MAX_X || y < MAP_MIN_Y || y > MAP_MAX_Y) return false
  // "object" and "water" are blocked; grass and path are walkable
  return grid[y][x] !== "object" && grid[y][x] !== "water"
}

const isInBounds = (x: number, y: number): boolean =>
  x >= MAP_MIN_X && x <= MAP_MAX_X && y >= MAP_MIN_Y && y <= MAP_MAX_Y

// ── Zone Definitions ──────────────────────────────────────────────────────────
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
  colorDark: string
  colorLight: string
  labelX: number
  labelY: number
  triggerX: number
  triggerY: number
  // "left" means dropdown opens to the left of the pin (for right-side zones)
  dropDir: "left" | "right" | "center"
  options: ZoneOption[]
}

const ZONES: Zone[] = [
  {
    id: "nature",
    label: "NATURE",
    title: "Naturaleza",
    subtitle: "Ahorro y crecimiento. Aprende a hacer crecer tus recursos.",
    icon: Leaf,
    color: "#2d8a4e",
    colorDark: "#1a5c33",
    colorLight: "#e8f5e2",
    labelX: 5,
    labelY: 3,
    triggerX: 5,
    triggerY: 7,
    dropDir: "right",
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
    subtitle: "Hábitos y rutina. Construye hábitos saludables y organiza tu día a día.",
    icon: Home,
    color: "#d4700a",
    colorDark: "#9a4e00",
    colorLight: "#fef3e2",
    labelX: 18,
    labelY: 2,
    triggerX: 15,
    triggerY: 7,
    dropDir: "left",
    options: [
      { label: "Hábitos", description: "Construye rutinas que mejoren tu vida" },
      { label: "Rutina", description: "Organiza tu d����a para ser más efectivo" },
      { label: "Organización", description: "Mantén tu espacio y mente en orden" },
    ],
  },
  {
    id: "business",
    label: "BUSINESS",
    title: "Negocios",
    subtitle: "Productos, decisiones y productividad. Mejora tus habilidades y gestiona tus finanzas.",
    icon: Briefcase,
    color: "#1a6fb5",
    colorDark: "#0d4a80",
    colorLight: "#e2f0fb",
    labelX: 4,
    labelY: 11,
    triggerX: 6,
    triggerY: 9,
    dropDir: "right",
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
    subtitle: "Ideas, estados y desafíos. Explora tu mente y supera desafíos.",
    icon: Sparkles,
    color: "#7b3fbe",
    colorDark: "#52208a",
    colorLight: "#f3eaff",
    labelX: 19,
    labelY: 10,
    triggerX: 14,
    triggerY: 10,
    dropDir: "left",
    options: [
      { label: "Ideas", description: "Explora conceptos y pensamientos creativos" },
      { label: "Estados", description: "Comprende tus emociones y mentalidad" },
      { label: "Desafíos", description: "Supera retos que pondrán a prueba tu mente" },
    ],
  },
  {
    id: "faq",
    label: "FUENTE",
    title: "Fuente Central",
    subtitle: "Centro del pueblo. Aquí puedes planificar tu camino y ver tu progreso general.",
    icon: HelpCircle,
    color: "#0e87b5",
    colorDark: "#075a7a",
    colorLight: "#e0f5fc",
    labelX: 11,
    labelY: 9,
    triggerX: 11,
    triggerY: 9,
    dropDir: "center",
    options: [
      { label: "Movimiento", description: "Usa WASD, flechas o el joystick virtual para mover a Piggy" },
      { label: "Interacción", description: "Acércate a una zona y presiona E o haz click en el pin" },
      { label: "Objetivo", description: "Explora cada zona del mapa y aprende sus lecciones únicas" },
    ],
  },
]

const manhattanDist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

// ── Sprite ────────────────────────────────────────────────────────────────────
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

// ── Darken helper ─────────────────────────────────────────────────────────────
function darkenColor(hex: string, factor: number): string {
  const n = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.floor(((n >> 16) & 0xff) * (1 - factor)))
  const g = Math.max(0, Math.floor(((n >> 8) & 0xff) * (1 - factor)))
  const b = Math.max(0, Math.floor((n & 0xff) * (1 - factor)))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

// ── Pin SVG path ──────────────────────────────────────────────────────────────
function pinPath(w: number, h: number, r: number): string {
  // w = total width, h = total height (including tail), r = corner radius of top circle
  // The pin is a circle on top + a pointed tail at the bottom center
  const cx = w / 2
  const circleBottom = h - (h - w) * 0.2 - r * 0.3
  const tailH = h - circleBottom + r * 0.3
  return [
    `M ${cx} ${h}`,
    `L ${cx - r * 0.5} ${circleBottom}`,
    `A ${r} ${r} 0 1 1 ${cx + r * 0.5} ${circleBottom}`,
    "Z",
  ].join(" ")
}

// ── Zone Marker — compact icon-only pin ───────────────────────────────────────
function ZoneMarker({
  zone,
  isNear,
  isOpen,
  onClick,
}: {
  zone: Zone
  isNear: boolean
  isOpen: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const Icon = zone.icon
  const cellW = 100 / GRID_COLS
  const cellH = 100 / GRID_ROWS

  const PW = 44        // pin width = circle diameter
  const TAIL = 14      // tail height below circle
  const PH = PW + TAIL // total pin height
  const R  = PW / 2    // circle radius
  // Circle center in SVG coords — the pinPath arc is centered at (PW/2, R)
  const CIRCLE_CY = R  // = 22px from top

  const scale = isOpen ? 1.12 : isNear ? 1.06 : 1

  return (
    <button
      onClick={onClick}
      className="absolute pointer-events-auto cursor-pointer"
      style={{
        left: `${zone.labelX * cellW + cellW / 2}%`,
        top: `${zone.labelY * cellH + cellH / 2}%`,
        transform: `translate(-50%, -${PH}px) scale(${scale})`,
        transformOrigin: "bottom center",
        zIndex: isOpen ? 40 : isNear ? 30 : 20,
        transition: "transform 0.15s ease",
        animation: isNear && !isOpen ? "marker-pulse 1.2s ease-in-out infinite" : "none",
      }}
      aria-label={`Entrar a ${zone.title}`}
    >
      {/* Shadow */}
      <div
        style={{
          position: "absolute",
          bottom: -4,
          left: "50%",
          transform: "translateX(-50%)",
          width: PW * 0.6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.25)",
          filter: "blur(3px)",
        }}
      />

      {/* Pin SVG */}
      <svg
        width={PW}
        height={PH}
        viewBox={`0 0 ${PW} ${PH}`}
        style={{
          display: "block",
          overflow: "visible",
          ...(zone.id === "nature" && { marginLeft: "-148px", marginTop: "34px" }),
          ...(zone.id === "home" && { marginLeft: "-136px", marginTop: "-6px" }),
          ...(zone.id === "business" && { marginLeft: "39px", marginTop: "23px" }),
          ...(zone.id === "abstract" && { marginLeft: "39px", marginTop: "23px" }),
        }}
      >
        {/* Circle (head of pin) */}
        <circle
          cx={PW / 2}
          cy={R}
          r={R}
          fill={zone.colorDark}
        />
        {/* Circle fill (slightly inset for depth) */}
        <circle
          cx={PW / 2}
          cy={R}
          r={R - 2}
          fill={zone.color}
        />
        {/* Shine on circle */}
        <circle
          cx={PW / 2 - R * 0.25}
          cy={R * 0.4}
          r={R * 0.22}
          fill="rgba(255,255,255,0.3)"
        />
        {/* Tail triangle pointing down */}
        <polygon
          points={`${PW / 2},${PW} ${PW / 2 - R * 0.45},${PW * 0.7} ${PW / 2 + R * 0.45},${PW * 0.7}`}
          fill={zone.colorDark}
        />

        {/* Icon — centered in circle */}
        <g transform={`translate(${PW / 2}, ${R})`}>
          <foreignObject
            x={-10}
            y={-10}
            width={20}
            height={20}
          >
            <div
              style={{
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                style={{ width: "100%", height: "100%", color: "#ffffff" }}
                strokeWidth={2.5}
              />
            </div>
          </foreignObject>
        </g>
      </svg>

      {/* "E" key badge when near and not open */}
      {isNear && !isOpen && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 18,
            height: 18,
            borderRadius: "3px",
            background: "#ffcc02",
            border: `2px solid ${zone.colorDark}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "8px",
            fontWeight: 900,
            color: zone.colorDark,
            letterSpacing: "0.3px",
            boxShadow: `0 2px 0 ${zone.colorDark}`,
          }}
        >
          E
        </div>
      )}
    </button>
  )
}

// ── Zone Dropdown Panel — floats next to the pin ──────────────────────────────
function ZoneDropdown({
  zone,
  onClose,
}: {
  zone: Zone
  onClose: () => void
}) {
  const Icon = zone.icon
  const cellW = 100 / GRID_COLS
  const cellH = 100 / GRID_ROWS
  const PH = 56

  const isFAQ = zone.id === "faq"

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // Position: anchored to pin tip, panel offset to left/right/center
  const pinLeft = `${zone.labelX * cellW + cellW / 2}%`
  const pinTop  = `${zone.labelY * cellH + cellH / 2}%`

  // Horizontal offset from pin center
  const offsetX = zone.dropDir === "left"
    ? "calc(-100% - 12px)"
    : zone.dropDir === "right"
      ? "12px"
      : "-50%"

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: pinLeft,
        top: pinTop,
        transform: `translate(${offsetX}, -${PH + 8}px)`,
        zIndex: 50,
        width: "clamp(190px, 28vw, 220px)",
      }}
    >
      {/* Panel */}
      <div
        style={{
          background: "#fffdf6",
          border: `4px solid ${zone.colorDark}`,
          borderRadius: "6px",
          boxShadow: `4px 4px 0 ${zone.colorDark}, 0 8px 20px rgba(0,0,0,0.3)`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: zone.color,
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `3px solid ${zone.colorDark}`,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "4px",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon style={{ width: 16, height: 16, color: "#ffffff" }} strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              {zone.title}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "9px",
                fontWeight: 500,
                lineHeight: 1.3,
                marginTop: 1,
              }}
            >
              {zone.subtitle}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 22,
              height: 22,
              borderRadius: "3px",
              background: "rgba(0,0,0,0.2)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Cerrar"
          >
            <X style={{ width: 10, height: 10, color: "#ffffff" }} strokeWidth={3} />
          </button>
        </div>

        {/* FAQ controls row */}
        {isFAQ && (
          <div
            style={{
              padding: "6px 10px",
              borderBottom: `2px solid ${zone.colorDark}33`,
              background: zone.colorLight,
              display: "flex",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Keyboard style={{ width: 11, height: 11, color: zone.colorDark }} strokeWidth={2} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: zone.colorDark }}>WASD</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Gamepad2 style={{ width: 11, height: 11, color: zone.colorDark }} strokeWidth={2} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: zone.colorDark }}>JOYSTICK</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MousePointerClick style={{ width: 11, height: 11, color: zone.colorDark }} strokeWidth={2} />
              <span style={{ fontSize: "9px", fontWeight: 700, color: zone.colorDark }}>CLICK</span>
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {zone.options.map((option) => (
            <div
              key={option.label}
              style={{
                padding: "7px 10px",
                borderRadius: "4px",
                background: zone.colorLight,
                border: `2px solid ${zone.colorDark}33`,
                cursor: "pointer",
                transition: "transform 0.1s ease",
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
            >
              <ChevronRight
                style={{ width: 10, height: 10, color: zone.color, flexShrink: 0, marginTop: 2 }}
                strokeWidth={3}
              />
              <div>
                <div style={{ color: zone.colorDark, fontSize: "11px", fontWeight: 800, lineHeight: 1.1 }}>
                  {option.label}
                </div>
                <div style={{ color: "#6d5c4e", fontSize: "9px", fontWeight: 500, lineHeight: 1.35, marginTop: 1 }}>
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pixel-style tail pointing up to pin */}
      <div
        style={{
          position: "absolute",
          top: -8,
          left: zone.dropDir === "left" ? "auto" : zone.dropDir === "right" ? 18 : "50%",
          right: zone.dropDir === "left" ? 18 : "auto",
          transform: zone.dropDir === "center" ? "translateX(-50%)" : "none",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `8px solid ${zone.colorDark}`,
        }}
      />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function NeighborhoodMap() {
  const [grid] = useState<CellType[][]>(initializeGrid)
  const [showPaths, setShowPaths] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  const [piggyPos, setPiggyPos] = useState({ x: 11, y: 9 })
  const [piggyDirection, setPiggyDirection] = useState<"down" | "up" | "left" | "right">("down")
  const [isMoving, setIsMoving] = useState(false)
  const [openZone, setOpenZone] = useState<Zone | null>(null)
  const [showMinimap, setShowMinimap] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const [joystickActive, setJoystickActive] = useState(false)
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCellHover = useCallback((x: number, y: number) => setHoveredCell({ x, y }), [])
  const handleCellLeave = useCallback(() => setHoveredCell(null), [])

  const triggerWalkAnimation = useCallback(() => {
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    setIsMoving(true)
    moveTimeoutRef.current = setTimeout(() => setIsMoving(false), 350)
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

  const nearestZone = (() => {
    let closest: Zone | null = null
    let minDist = Infinity
    for (const z of ZONES) {
      const d = manhattanDist(piggyPos, { x: z.triggerX, y: z.triggerY })
      if (d <= 2 && d < minDist) { minDist = d; closest = z }
    }
    return closest
  })()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMinimap(false)
        setOpenZone(null)
        e.preventDefault()
        return
      }
      if (openZone) return
      const key = e.key.toLowerCase()
      switch (key) {
        case "arrowup":    case "w": movePiggy(0, -1, "up");    e.preventDefault(); break
        case "arrowdown":  case "s": movePiggy(0,  1, "down");  e.preventDefault(); break
        case "arrowleft":  case "a": movePiggy(-1, 0, "left");  e.preventDefault(); break
        case "arrowright": case "d": movePiggy(1,  0, "right"); e.preventDefault(); break
        case "e": case "enter":
          if (nearestZone) { setOpenZone(nearestZone); e.preventDefault() }
          break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiggy, nearestZone, openZone])

  useEffect(() => {
    return () => { if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current) }
  }, [])

  const handleJoystickStart = useCallback(() => setJoystickActive(true), [])

  // Joystick throttle ref — prevents too-fast movement
  const joystickThrottleRef = useRef<number>(0)
  const JOYSTICK_THROTTLE_MS = 180 // Minimum ms between joystick moves

  const handleJoystickMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!joystickRef.current || !joystickActive) return
      
      // Throttle joystick input
      const now = Date.now()
      if (now - joystickThrottleRef.current < JOYSTICK_THROTTLE_MS) return
      
      const rect = joystickRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      const distance = Math.sqrt(x * x + y * y)
      
      // Higher threshold = less sensitive (need to move further from center)
      if (distance > 20) {
        const angle = Math.atan2(y, x)
        let dir: "down" | "up" | "left" | "right" | null = null
        if      (angle > -Math.PI / 4 && angle < Math.PI / 4)       dir = "right"
        else if (angle > Math.PI / 4 && angle < (3 * Math.PI) / 4)  dir = "down"
        else if (angle < -Math.PI / 4 && angle > -(3 * Math.PI) / 4) dir = "up"
        else                                                           dir = "left"
        if (dir) {
          joystickThrottleRef.current = now
          const dx = dir === "right" ? 1 : dir === "left" ? -1 : 0
          const dy = dir === "down"  ? 1 : dir === "up"   ? -1 : 0
          movePiggy(dx, dy, dir)
        }
      }
    },
    [joystickActive, movePiggy]
  )

  const handleJoystickEnd = useCallback(() => setJoystickActive(false), [])

  const cellW = 100 / GRID_COLS
  const cellH = 100 / GRID_ROWS
  const piggyScreenX = piggyPos.x * cellW + cellW / 2
  const piggyScreenY = piggyPos.y * cellH + cellH / 2

  return (
    // Outer: full screen, black bg, centers the map box
    <div className="fixed inset-0 overflow-hidden bg-black flex items-center justify-center touch-none">
      {/*
        Inner map container: maintains the map's 16:9 aspect ratio.
        On landscape it fills the height; on portrait it fills the width.
        All overlays are relative to THIS box, not the full screen.
      */}
      <div
        className="relative"
        style={{
          // max width while keeping 16:9 ratio
          width: "min(100vw, calc(100vh * (24/18)))",
          height: "min(100vh, calc(100vw * (18/24)))",
          flexShrink: 0,
        }}
      >

      {/* Background — fills the map box exactly */}
      <img
        src="/neighborhood-background.png"
        alt="Mapa del vecindario"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
        draggable={false}
      />

      {/* Hit-test grid */}
      <div
        className="absolute inset-0"
        style={{ cursor: showPaths ? "crosshair" : "default", pointerEvents: "auto" }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const inBounds = isInBounds(x, y)
            const walkable = isWalkable(x, y, grid)
            const isHovered = hoveredCell?.x === x && hoveredCell?.y === y
            let bg = "transparent"
            if (showPaths) {
              if (!inBounds)  bg = "rgba(0,0,0,0.22)"
              else            bg = walkable ? "rgba(255,215,60,0.15)" : "rgba(255,60,60,0.18)"
            }
            if (showPaths && isHovered) bg = walkable ? "rgba(80,255,120,0.4)" : "rgba(255,60,60,0.5)"
            return (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * cellW}%`, top: `${y * cellH}%`,
                  width: `${cellW}%`, height: `${cellH}%`,
                  backgroundColor: bg,
                  outline: showPaths ? `1px solid rgba(0,0,0,0.08)` : "none",
                }}
                onMouseEnter={() => handleCellHover(x, y)}
                onMouseLeave={handleCellLeave}
              />
            )
          })
        )}
      </div>

      {/* Cartel del mapa — pin idéntico al de las zonas, anclado al tablero */}
      {(() => {
        const PW = 44
        const TAIL = 14
        const PH = PW + TAIL
        const R  = PW / 2
        // Colors: amber/dorado para diferenciarlo de los otros pins
        const pinColor     = "#f59e0b"
        const pinColorDark = "#b45309"
        return (
          <button
            onClick={() => setShowMinimap(true)}
            className="absolute pointer-events-auto"
            style={{
              // Anchor tip of pin to center of mapboard object (x:11.5, y:5)
              left:   `${11.5 * cellW}%`,
              top:    `${5    * cellH}%`,
              width:  PW,
              height: PH,
              transform:       `translate(-50%, -${PH}px)`,
              transformOrigin: "bottom center",
              cursor:    "pointer",
              background: "transparent",
              border:    showPaths ? "2px dashed rgba(255,200,0,0.9)" : "none",
              padding:   0,
              transition: "transform 0.15s ease",
              marginTop: "12px",
              marginLeft: "16px",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = `translate(-50%, -${PH}px) scale(1.12)`)}
            onMouseLeave={e => (e.currentTarget.style.transform = `translate(-50%, -${PH}px) scale(1)`)}
            onMouseDown ={e => (e.currentTarget.style.transform = `translate(-50%, -${PH}px) scale(0.96)`)}
            onMouseUp   ={e => (e.currentTarget.style.transform = `translate(-50%, -${PH}px) scale(1.12)`)}
            title="Ver minimapa"
            aria-label="Abrir minimapa"
          >
            {/* Drop shadow */}
            <div style={{
              position:    "absolute",
              bottom:      -4,
              left:        "50%",
              transform:   "translateX(-50%)",
              width:       PW * 0.6,
              height:      6,
              borderRadius:"50%",
              background:  "rgba(0,0,0,0.25)",
              filter:      "blur(3px)",
              pointerEvents: "none",
            }} />

            {/* Pin SVG — same structure as ZoneMarker */}
            <svg
              width={PW}
              height={PH}
              viewBox={`0 0 ${PW} ${PH}`}
              style={{
                display: "block",
                overflow: "visible",
                pointerEvents: "none",
                marginLeft: "39px",
                marginTop: "23px",
              }}
            >
              {/* Circle border */}
              <circle cx={PW / 2} cy={R} r={R}     fill={pinColorDark} />
              {/* Circle fill */}
              <circle cx={PW / 2} cy={R} r={R - 2} fill={pinColor} />
              {/* Shine */}
              <circle cx={PW / 2 - R * 0.25} cy={R * 0.4} r={R * 0.22} fill="rgba(255,255,255,0.35)" />
              {/* Tail */}
              <polygon
                points={`${PW/2},${PW} ${PW/2 - R*0.45},${PW*0.7} ${PW/2 + R*0.45},${PW*0.7}`}
                fill={pinColorDark}
              />
              {/* Map scroll icon centered in circle */}
              <g transform={`translate(${PW / 2}, ${R})`}>
                <foreignObject x={-11} y={-9} width={22} height={18}>
                  <div
                    style={{ width: 22, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                      <rect x="0.75" y="1.75" width="18.5" height="12.5" rx="1" fill="#fff8e1" stroke="#7c3f00" strokeWidth="1.5"/>
                      <line x1="7"  y1="2" x2="7"  y2="14" stroke="#d4a96a" strokeWidth="1"/>
                      <line x1="13" y1="2" x2="13" y2="14" stroke="#d4a96a" strokeWidth="1"/>
                      <circle cx="10" cy="8" r="2.2" fill="#e53935" stroke="#7c3f00" strokeWidth="1.2"/>
                      <circle cx="10" cy="8" r="0.8" fill="#fff8e1"/>
                    </svg>
                  </div>
                </foreignObject>
              </g>
            </svg>
          </button>
        )
      })()}

      {/* Zone pins */}
      {ZONES.map((zone) => (
        <ZoneMarker
          key={zone.id}
          zone={zone}
          isNear={nearestZone?.id === zone.id}
          isOpen={openZone?.id === zone.id}
          onClick={(e) => { e.stopPropagation(); setOpenZone((prev) => (prev?.id === zone.id ? null : zone)) }}
        />
      ))}

      {/* Zone dropdown panels */}
      {openZone && (
        <ZoneDropdown zone={openZone} onClose={() => setOpenZone(null)} />
      )}

      {/* Minimap modal — opens on map click */}
      {showMinimap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(20,12,6,0.82)" }}
          onClick={() => setShowMinimap(false)}
        >
          <div
            className="relative"
            style={{
              maxWidth: "min(92vw, 900px)",
              maxHeight: "90vh",
              border: "5px solid #4e342e",
              borderRadius: "6px",
              boxShadow: "inset -4px -4px 0 #3e2723, inset 4px 4px 0 #8d6e63, 0 12px 48px rgba(0,0,0,0.6), 0 6px 0 #3e2723",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar */}
            <div
              style={{
                background: "#5d4037",
                borderBottom: "4px solid #4e342e",
                boxShadow: "inset 0 -2px 0 #3e2723, inset 0 2px 0 #8d6e63",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{
                color: "#fff8e1",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}>
                Minimapa y Edificios
              </div>
              <button
                onClick={() => setShowMinimap(false)}
                style={{
                  background: "#c62828",
                  border: "3px solid #4e342e",
                  borderRadius: "3px",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "inset -2px -2px 0 #b71c1c, inset 2px 2px 0 #ef5350",
                  flexShrink: 0,
                }}
                aria-label="Cerrar minimapa"
              >
                <X style={{ width: 14, height: 14, color: "#fff8e1" }} strokeWidth={3} />
              </button>
            </div>

            {/* Minimap image */}
            <img
              src="/minimapa.png"
              alt="Minimapa del vecindario con guia de edificios"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxHeight: "calc(90vh - 52px)",
                objectFit: "contain",
                imageRendering: "pixelated",
              }}
              draggable={false}
            />
          </div>

          {/* "TOCA para cerrar" hint on mobile, "ESC para cerrar" on desktop */}
          <div
            className="hidden sm:block"
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#3e2723",
              color: "#d7ccc8",
              border: "2px solid #6d4c41",
              borderRadius: "3px",
              padding: "3px 12px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            ESC PARA CERRAR
          </div>
          {/* Mobile hint */}
          <div
            className="sm:hidden"
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#3e2723",
              color: "#d7ccc8",
              border: "2px solid #6d4c41",
              borderRadius: "3px",
              padding: "3px 12px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            TOCA PARA CERRAR
          </div>
        </div>
      )}

      {/* Piggy — size is 2×cell so it scales naturally with the map box */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          left: `${piggyScreenX}%`,
          top: `${piggyScreenY}%`,
          width: `${cellW * 2}%`,
          height: `${cellH * 2}%`,
          transform: "translate(-50%, -62%)",
          transition: "left 0.12s linear, top 0.12s linear",
        }}
      >
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
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
                opacity: dir === piggyDirection ? 1 : 0,
                animation: isMoving && dir === piggyDirection ? "walk-bounce 0.3s ease-in-out infinite" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom-right controls */}
      <div
        className="absolute z-40 flex items-center gap-1 sm:gap-2 pointer-events-auto"
        style={{
          bottom: "clamp(10px, 2.5vw, 14px)",
          right:  "clamp(10px, 2.5vw, 14px)",
        }}
      >
        {showPaths && hoveredCell && (
          <div
            style={{
              background: isWalkable(hoveredCell.x, hoveredCell.y, grid) ? "#2d8a4e" : "#c0392b",
              color: "#fff",
              border: "3px solid #3e2723",
              borderRadius: "3px",
              padding: "3px 8px",
              fontSize: "9px",
              fontWeight: 800,
              boxShadow: "0 2px 0 #3e2723",
            }}
          >
            {hoveredCell.x},{hoveredCell.y} {isWalkable(hoveredCell.x, hoveredCell.y, grid) ? "OK" : "X"}
          </div>
        )}

        {/* Hide keyboard hint on mobile */}
        <div
          className="hidden sm:block"
          style={{
            background: "#fffdf6",
            border: "3px solid #4e342e",
            borderRadius: "3px",
            padding: "4px 10px",
            fontSize: "9px",
            fontWeight: 800,
            color: "#4e342e",
            letterSpacing: "0.3px",
            boxShadow: "0 3px 0 #3e2723",
          }}
        >
          WASD | E = ENTRAR
        </div>

        <button
          onClick={() => setShowPaths((v) => !v)}
          style={{
            background: showPaths ? "#ffcc02" : "#fffdf6",
            color: "#4e342e",
            border: "3px solid #4e342e",
            borderRadius: "3px",
            padding: "4px 8px",
            fontSize: "9px",
            fontWeight: 800,
            boxShadow: showPaths
              ? "inset -2px -2px 0 #e6b800, inset 2px 2px 0 #ffe599, 0 3px 0 #3e2723"
              : "0 3px 0 #3e2723",
            display: "flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
          }}
        >
          {showPaths
            ? <Eye style={{ width: 12, height: 12 }} strokeWidth={3} />
            : <EyeOff style={{ width: 12, height: 12 }} strokeWidth={3} />
          }
        </button>
      </div>

      {/* Bottom-left: virtual joystick */}
      <div
        ref={joystickRef}
        className="absolute z-40 pointer-events-auto touch-none select-none"
        style={{
          bottom: "clamp(12px, 3vw, 16px)",
          left:   "clamp(12px, 3vw, 16px)",
          width:  "clamp(80px, 14vw, 104px)",
          height: "clamp(80px, 14vw, 104px)",
          background: joystickActive ? "rgba(93, 64, 55, 0.2)" : "rgba(255, 253, 246, 0.2)",
          border: "4px solid rgba(78, 52, 46, 0.2)",
          borderRadius: "50%",
          boxShadow: joystickActive
            ? "inset -3px -3px 0 rgba(62, 39, 35, 0.2), inset 3px 3px 0 rgba(141, 110, 99, 0.2), 0 4px 0 rgba(62, 39, 35, 0.2)"
            : "inset -3px -3px 0 rgba(215, 204, 200, 0.2), inset 3px 3px 0 rgba(255, 248, 225, 0.2), 0 4px 0 rgba(78, 52, 46, 0.2)",
          cursor: "grab",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          backdropFilter: "blur(1px)",
        }}
        onPointerDown={handleJoystickStart}
        onPointerMove={handleJoystickMove}
        onPointerUp={handleJoystickEnd}
        onPointerLeave={handleJoystickEnd}
      >
        {/* D-pad cross */}
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <div style={{
            position: "absolute", top: "50%", left: "25%", right: "25%", height: 6,
            marginTop: -3, background: joystickActive ? "#8d6e63" : "#bcaaa4", borderRadius: 2,
          }} />
          <div style={{
            position: "absolute", left: "50%", top: "25%", bottom: "25%", width: 6,
            marginLeft: -3, background: joystickActive ? "#8d6e63" : "#bcaaa4", borderRadius: 2,
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 18, height: 18, marginTop: -9, marginLeft: -9,
            background: joystickActive ? "#ffcc02" : "#bcaaa4",
            border: "2px solid #4e342e", borderRadius: "50%",
          }} />
        </div>
      </div>

      </div> {/* end inner map container */}
    </div>
  )
}
