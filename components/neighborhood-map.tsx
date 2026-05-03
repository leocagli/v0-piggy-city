"use client"

import { useState, useEffect, useCallback } from "react"
import { Home, Briefcase, Leaf, Sparkles, TreePine, Droplets, Building2, Castle, Flower2 } from "lucide-react"

// Grid configuration
const GRID_SIZE = 20
const CELL_SIZE = 40

// Cell types
type CellType = "grass" | "path" | "water" | "nature-zone" | "home-zone" | "business-zone" | "abstract-zone"

// Object types for obstacles
interface MapObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: "house" | "building" | "tree" | "fountain" | "portal" | "bridge" | "rock" | "flower"
  zone: "nature" | "home" | "business" | "abstract" | "neutral"
  label?: string
}

// Zone labels
interface ZoneLabel {
  id: string
  x: number
  y: number
  zone: "nature" | "home" | "business" | "abstract"
  title: string
  subtitle: string
}

// Path nodes for NPC navigation
interface PathNode {
  x: number
  y: number
}

// Map data
const mapObjects: MapObject[] = [
  // Nature Zone
  { id: "tree-1", x: 1, y: 1, width: 2, height: 2, type: "tree", zone: "nature" },
  { id: "tree-2", x: 0, y: 4, width: 2, height: 2, type: "tree", zone: "nature" },
  { id: "tree-3", x: 3, y: 0, width: 1, height: 1, type: "tree", zone: "nature" },
  { id: "rock-1", x: 4, y: 2, width: 1, height: 1, type: "rock", zone: "nature" },
  { id: "flower-1", x: 2, y: 5, width: 1, height: 1, type: "flower", zone: "nature" },
  
  // Home Zone
  { id: "house-1", x: 14, y: 1, width: 4, height: 3, type: "house", zone: "home", label: "Casa Principal" },
  { id: "flower-2", x: 13, y: 3, width: 1, height: 1, type: "flower", zone: "home" },
  { id: "tree-4", x: 18, y: 0, width: 2, height: 2, type: "tree", zone: "home" },
  
  // Business Zone
  { id: "building-1", x: 1, y: 12, width: 4, height: 4, type: "building", zone: "business", label: "Oficina" },
  { id: "tree-5", x: 0, y: 11, width: 1, height: 1, type: "tree", zone: "business" },
  { id: "tree-6", x: 5, y: 15, width: 1, height: 1, type: "tree", zone: "business" },
  
  // Abstract Zone
  { id: "portal-1", x: 14, y: 13, width: 3, height: 3, type: "portal", zone: "abstract", label: "Portal" },
  { id: "rock-2", x: 17, y: 12, width: 1, height: 1, type: "rock", zone: "abstract" },
  { id: "rock-3", x: 13, y: 16, width: 1, height: 1, type: "rock", zone: "abstract" },
  
  // Center
  { id: "fountain-1", x: 9, y: 9, width: 2, height: 2, type: "fountain", zone: "neutral", label: "Fuente" },
  
  // Bridge
  { id: "bridge-1", x: 5, y: 7, width: 2, height: 1, type: "bridge", zone: "neutral" },
]

const zoneLabels: ZoneLabel[] = [
  { id: "label-nature", x: 1, y: 7, zone: "nature", title: "NATURE", subtitle: "Ahorro y crecimiento" },
  { id: "label-home", x: 15, y: 5, zone: "home", title: "HOME", subtitle: "Hábitos y rutina" },
  { id: "label-business", x: 1, y: 17, zone: "business", title: "BUSINESS", subtitle: "Producto y decisiones" },
  { id: "label-abstract", x: 14, y: 17, zone: "abstract", title: "ABSTRACT", subtitle: "Ideas y desafíos" },
]

// Initialize the grid
const initializeGrid = (): CellType[][] => {
  const grid: CellType[][] = []
  
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: CellType[] = []
    for (let x = 0; x < GRID_SIZE; x++) {
      // Define zones
      if (x < 7 && y < 8) {
        row.push("nature-zone")
      } else if (x >= 13 && y < 8) {
        row.push("home-zone")
      } else if (x < 7 && y >= 12) {
        row.push("business-zone")
      } else if (x >= 13 && y >= 12) {
        row.push("abstract-zone")
      } else {
        row.push("grass")
      }
    }
    grid.push(row)
  }
  
  // Add water (river on left side)
  for (let y = 0; y < GRID_SIZE; y++) {
    if (y < 7 || y > 8) {
      grid[y][0] = "water"
      if (y < 6) grid[y][1] = "water"
    }
  }
  
  // Add paths (connecting all zones)
  // Horizontal main path
  for (let x = 2; x < 18; x++) {
    grid[8][x] = "path"
    grid[9][x] = "path"
  }
  
  // Vertical main path
  for (let y = 2; y < 18; y++) {
    grid[y][10] = "path"
    grid[y][11] = "path"
  }
  
  // Secondary paths to zones
  // To Nature zone
  for (let x = 5; x < 10; x++) {
    grid[4][x] = "path"
  }
  
  // To Home zone
  for (let x = 12; x < 15; x++) {
    grid[4][x] = "path"
  }
  
  // To Business zone
  for (let y = 10; y < 14; y++) {
    grid[y][5] = "path"
  }
  
  // To Abstract zone  
  for (let y = 10; y < 14; y++) {
    grid[y][14] = "path"
  }
  
  return grid
}

// Path network for NPCs
const pathNetwork: PathNode[] = [
  // Main crossroads
  { x: 10, y: 8 }, { x: 10, y: 9 }, { x: 11, y: 8 }, { x: 11, y: 9 },
  // Horizontal path
  { x: 3, y: 8 }, { x: 5, y: 8 }, { x: 7, y: 8 }, { x: 13, y: 8 }, { x: 15, y: 8 }, { x: 17, y: 8 },
  { x: 3, y: 9 }, { x: 5, y: 9 }, { x: 7, y: 9 }, { x: 13, y: 9 }, { x: 15, y: 9 }, { x: 17, y: 9 },
  // Vertical path
  { x: 10, y: 3 }, { x: 10, y: 5 }, { x: 10, y: 12 }, { x: 10, y: 14 }, { x: 10, y: 16 },
  { x: 11, y: 3 }, { x: 11, y: 5 }, { x: 11, y: 12 }, { x: 11, y: 14 }, { x: 11, y: 16 },
  // To nature
  { x: 5, y: 4 }, { x: 7, y: 4 }, { x: 9, y: 4 },
  // To home
  { x: 12, y: 4 }, { x: 13, y: 4 }, { x: 14, y: 4 },
  // To business
  { x: 5, y: 11 }, { x: 5, y: 12 }, { x: 5, y: 13 },
  // To abstract
  { x: 14, y: 11 }, { x: 14, y: 12 }, { x: 14, y: 13 },
]

// Check if a cell is walkable
const isWalkable = (x: number, y: number, grid: CellType[][]): boolean => {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false
  const cell = grid[y][x]
  if (cell === "water") return false
  
  // Check if blocked by an object
  for (const obj of mapObjects) {
    if (obj.type === "bridge") continue // Bridges are walkable
    if (x >= obj.x && x < obj.x + obj.width && y >= obj.y && y < obj.y + obj.height) {
      return false
    }
  }
  
  return true
}

// Get cell background color
const getCellColor = (type: CellType): string => {
  switch (type) {
    case "grass":
      return "bg-grass"
    case "path":
      return "bg-path"
    case "water":
      return "bg-water"
    case "nature-zone":
      return "bg-nature-light"
    case "home-zone":
      return "bg-home-light"
    case "business-zone":
      return "bg-business-light"
    case "abstract-zone":
      return "bg-abstract-light"
    default:
      return "bg-grass"
  }
}

// Render object
const renderObject = (obj: MapObject) => {
  const style = {
    left: obj.x * CELL_SIZE,
    top: obj.y * CELL_SIZE,
    width: obj.width * CELL_SIZE,
    height: obj.height * CELL_SIZE,
  }
  
  const baseClasses = "absolute flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
  
  switch (obj.type) {
    case "house":
      return (
        <div key={obj.id} style={style} className={`${baseClasses} group`}>
          <div className="w-full h-full bg-home rounded-lg border-4 border-home flex flex-col items-center justify-center shadow-lg">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[25px] border-l-transparent border-r-transparent border-b-amber-700" />
            <Home className="w-8 h-8 text-home-foreground" />
            {obj.label && (
              <span className="text-[10px] font-bold text-home-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {obj.label}
              </span>
            )}
          </div>
        </div>
      )
    case "building":
      return (
        <div key={obj.id} style={style} className={`${baseClasses} group`}>
          <div className="w-full h-full bg-business rounded-lg border-4 border-business flex flex-col items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
            {obj.label && (
              <span className="text-[10px] font-bold text-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {obj.label}
              </span>
            )}
          </div>
        </div>
      )
    case "tree":
      return (
        <div key={obj.id} style={style} className={`${baseClasses}`}>
          <div className="w-full h-full flex items-center justify-center">
            <TreePine className="w-8 h-8 text-nature drop-shadow-md" />
          </div>
        </div>
      )
    case "fountain":
      return (
        <div key={obj.id} style={style} className={`${baseClasses} group`}>
          <div className="w-full h-full bg-water/50 rounded-full border-4 border-water flex items-center justify-center shadow-lg">
            <Droplets className="w-8 h-8 text-water animate-pulse" />
          </div>
        </div>
      )
    case "portal":
      return (
        <div key={obj.id} style={style} className={`${baseClasses} group`}>
          <div className="w-full h-full bg-abstract rounded-full border-4 border-abstract flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
      )
    case "bridge":
      return (
        <div key={obj.id} style={style} className={`${baseClasses}`}>
          <div className="w-full h-full bg-amber-800 rounded border-2 border-amber-900 flex items-center justify-center">
            <div className="w-full h-2 bg-amber-700 rounded" />
          </div>
        </div>
      )
    case "rock":
      return (
        <div key={obj.id} style={style} className={`${baseClasses}`}>
          <div className="w-6 h-6 bg-gray-400 rounded-full shadow-md" />
        </div>
      )
    case "flower":
      return (
        <div key={obj.id} style={style} className={`${baseClasses}`}>
          <Flower2 className="w-6 h-6 text-pink-400" />
        </div>
      )
    default:
      return null
  }
}

// Render zone label
const renderZoneLabel = (label: ZoneLabel) => {
  const zoneColors = {
    nature: "bg-nature text-white",
    home: "bg-home text-white",
    business: "bg-business text-white",
    abstract: "bg-abstract text-white",
  }
  
  const zoneIcons = {
    nature: <Leaf className="w-4 h-4" />,
    home: <Home className="w-4 h-4" />,
    business: <Briefcase className="w-4 h-4" />,
    abstract: <Sparkles className="w-4 h-4" />,
  }
  
  return (
    <div
      key={label.id}
      className={`absolute px-3 py-2 rounded-lg ${zoneColors[label.zone]} shadow-lg z-20`}
      style={{
        left: label.x * CELL_SIZE,
        top: label.y * CELL_SIZE,
      }}
    >
      <div className="flex items-center gap-2">
        {zoneIcons[label.zone]}
        <span className="font-bold text-sm">{label.title}</span>
      </div>
      <p className="text-xs opacity-80 mt-1">{label.subtitle}</p>
    </div>
  )
}

export function NeighborhoodMap() {
  const [grid] = useState<CellType[][]>(initializeGrid)
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null)
  const [showPaths, setShowPaths] = useState(true)
  
  // Highlight walkable cells
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  
  const handleCellHover = useCallback((x: number, y: number) => {
    setHoveredCell({ x, y })
  }, [])
  
  const handleCellLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])
  
  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl shadow-md border-2 border-border">
            <Castle className="w-6 h-6 text-primary" />
            <span className="font-bold text-card-foreground">Vecindario</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaths(!showPaths)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPaths 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            {showPaths ? "Ocultar Caminos" : "Mostrar Caminos"}
          </button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-path border border-path-dark" />
          <span className="text-foreground">Camino (transitable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-grass border border-nature" />
          <span className="text-foreground">Zona verde</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-water border border-business" />
          <span className="text-foreground">Agua (no transitable)</span>
        </div>
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-home" />
          <span className="text-foreground">Objeto (no transitable)</span>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative bg-card p-4 rounded-2xl shadow-2xl border-4 border-border overflow-hidden">
        {/* Grid */}
        <div 
          className="relative"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Render cells */}
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const walkable = isWalkable(x, y, grid)
              const isHovered = hoveredCell?.x === x && hoveredCell?.y === y
              const isPath = cell === "path"
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`absolute transition-all duration-150 ${getCellColor(cell)} ${
                    isHovered && walkable ? "ring-2 ring-primary ring-inset" : ""
                  } ${isHovered && !walkable ? "ring-2 ring-destructive ring-inset" : ""} ${
                    showPaths && isPath ? "opacity-100" : ""
                  }`}
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                  onMouseEnter={() => handleCellHover(x, y)}
                  onMouseLeave={handleCellLeave}
                >
                  {/* Path indicator */}
                  {showPaths && isPath && (
                    <div className="absolute inset-1 rounded bg-path-dark/30" />
                  )}
                </div>
              )
            })
          )}
          
          {/* Render path network nodes (debug) */}
          {showPaths && pathNetwork.map((node, i) => (
            <div
              key={`node-${i}`}
              className="absolute w-2 h-2 bg-primary rounded-full opacity-50 z-10"
              style={{
                left: node.x * CELL_SIZE + CELL_SIZE / 2 - 4,
                top: node.y * CELL_SIZE + CELL_SIZE / 2 - 4,
              }}
            />
          ))}
          
          {/* Render objects */}
          {mapObjects.map(renderObject)}
          
          {/* Render zone labels */}
          {zoneLabels.map(renderZoneLabel)}
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="w-full max-w-4xl bg-card rounded-xl p-4 shadow-lg border-2 border-border">
        <h3 className="font-bold text-lg text-card-foreground mb-2">Información del Mapa</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nature flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Nature</p>
              <p className="text-muted-foreground text-xs">Zona natural</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-home flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Home</p>
              <p className="text-muted-foreground text-xs">Zona residencial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-business flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Business</p>
              <p className="text-muted-foreground text-xs">Zona comercial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-abstract flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Abstract</p>
              <p className="text-muted-foreground text-xs">Zona mágica</p>
            </div>
          </div>
        </div>
        
        {/* Hover info */}
        {hoveredCell && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Celda:</strong> ({hoveredCell.x}, {hoveredCell.y}) - 
              <strong className={isWalkable(hoveredCell.x, hoveredCell.y, grid) ? " text-primary" : " text-destructive"}>
                {isWalkable(hoveredCell.x, hoveredCell.y, grid) ? " Transitable" : " No transitable"}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
