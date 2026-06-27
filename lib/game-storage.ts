// lib/game-storage.ts
// Versioned, SSR/hydration-safe localStorage persistence for Piggy City.
// Single source of truth for ALL saved state (position, coins, zones, audio pref).
// No per-render reads. No per-frame writes (debounced + flush on hide). Zero deps.

export const STORAGE_KEY = "piggy-city:v1"
export const SCHEMA_VERSION = 1

export type Dir = "up" | "down" | "left" | "right"

export interface GameSave {
  schemaVersion: number
  pos: { x: number; y: number } // FLOAT grid coords (posRef.current)
  dir: Dir
  coins: number
  collected: string[] // serialized Set<string> of coin ids
  zonesVisited: string[] // serialized Set<ZoneId> (themed zones only)
  muted: boolean
}

// Must match the component's useState initializers EXACTLY so SSR === first client paint.
export const DEFAULTS: GameSave = {
  schemaVersion: SCHEMA_VERSION,
  pos: { x: 11, y: 9 }, // matches posRef = useRef({x:11,y:9})
  dir: "down", // matches piggyDirection initial "down"
  coins: 0,
  collected: [],
  zonesVisited: [],
  muted: false,
}

const isBrowser = () => typeof window !== "undefined"

// Walkable map bounds (mirror of the constants in neighborhood-map.tsx) — used to
// clamp a corrupt/out-of-range saved position so Piggy can never load off-map.
const MAP_MIN_X = 3, MAP_MAX_X = 22, MAP_MIN_Y = 1, MAP_MAX_Y = 16
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

// Migrate an unknown/older blob up to the current schema, coercing every field
// against DEFAULTS so a partial/corrupt blob can never crash the game.
function migrate(raw: any): GameSave {
  const data = raw
  const pos =
    data?.pos && Number.isFinite(data.pos.x) && Number.isFinite(data.pos.y)
      ? { x: clamp(data.pos.x, MAP_MIN_X, MAP_MAX_X), y: clamp(data.pos.y, MAP_MIN_Y, MAP_MAX_Y) }
      : { ...DEFAULTS.pos }
  const dir: Dir =
    data?.dir === "up" || data?.dir === "down" || data?.dir === "left" || data?.dir === "right"
      ? data.dir
      : DEFAULTS.dir
  return {
    schemaVersion: SCHEMA_VERSION,
    pos,
    dir,
    coins: Number.isFinite(data?.coins) ? data.coins : DEFAULTS.coins,
    collected: Array.isArray(data?.collected) ? data.collected.filter((s: any) => typeof s === "string") : [],
    zonesVisited: Array.isArray(data?.zonesVisited) ? data.zonesVisited.filter((s: any) => typeof s === "string") : [],
    muted: typeof data?.muted === "boolean" ? data.muted : DEFAULTS.muted,
  }
}

// SAFE load: returns DEFAULTS on SSR, missing key, corrupt JSON, or quota/security error.
// CRITICAL: seeds the `pending` writer buffer with the loaded save so subsequent
// PARTIAL queue() merges (position-only, mute-only, etc.) build on the real saved
// state instead of stale DEFAULTS — otherwise the first flush after a reload would
// wipe every field the user hasn't re-touched this session.
export function load(): GameSave {
  if (!isBrowser()) return { ...DEFAULTS }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const result = raw ? migrate(JSON.parse(raw)) : { ...DEFAULTS }
    pending = { ...result }
    hasPending = false
    return result
  } catch {
    // Corrupted JSON or private-mode read error -> reset to a clean slate.
    try { window.localStorage.removeItem(STORAGE_KEY) } catch {}
    pending = { ...DEFAULTS }
    hasPending = false
    return { ...DEFAULTS }
  }
}

// ── Debounced writer ──────────────────────────────────────────────────────────
let pending: GameSave = { ...DEFAULTS }
let hasPending = false
let timer: ReturnType<typeof setTimeout> | null = null
let storageOk = true // flips false on first quota/security failure -> stop retrying
const DEBOUNCE_MS = 600

function writeNow() {
  if (!isBrowser() || !storageOk || !hasPending) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
    hasPending = false
  } catch {
    // QuotaExceededError / private-mode SecurityError: disable further writes
    // so we don't thrash. State stays in-memory for the session.
    storageOk = false
  }
}

// Cheap: merge a partial into the in-memory buffer + arm the debounce. NEVER
// serializes or touches localStorage here, so it's safe to call from the rAF loop.
export function queue(partial: Partial<Omit<GameSave, "schemaVersion">>) {
  pending = { ...pending, ...partial, schemaVersion: SCHEMA_VERSION }
  hasPending = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(writeNow, DEBOUNCE_MS)
}

// Specialized fast path for the movement-stop edge.
export function queuePosition(x: number, y: number, dir: Dir) {
  queue({ pos: { x, y }, dir })
}

// Force an immediate write (call on visibilitychange=hidden / pagehide / unmount).
export function flush() {
  if (timer) { clearTimeout(timer); timer = null }
  writeNow()
}

// Hard reset (e.g. a "New game" button).
export function reset() {
  pending = { ...DEFAULTS }
  hasPending = true
  flush()
}

export const GameStorage = {
  load,
  queue,
  queuePosition,
  flush,
  reset,
  DEFAULTS,
  STORAGE_KEY,
  SCHEMA_VERSION,
}
