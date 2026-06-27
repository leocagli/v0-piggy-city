// lib/accessories.ts — cosmetic accessories for Piggy. Emoji art = zero-cost,
// crisp at any size (rendered as scalable SVG <text>). Bought in the shop with
// collected coins, equipped on the character, persisted via game-storage.

export interface Accessory {
  id: string
  emoji: string
  name: string
  cost: number
  /** Vertical nudge (% of the pig box) so each item sits nicely on the head. */
  offsetY?: number
}

export const ACCESSORIES: Accessory[] = [
  { id: "flower", emoji: "🌸", name: "Flor",       cost: 2 },
  { id: "bow",    emoji: "🎀", name: "Moño",       cost: 4 },
  { id: "tophat", emoji: "🎩", name: "Sombrero",   cost: 6, offsetY: -4 },
  { id: "star",   emoji: "⭐", name: "Estrella",   cost: 8, offsetY: -6 },
  { id: "crown",  emoji: "👑", name: "Corona",     cost: 12, offsetY: -2 },
  { id: "cap",    emoji: "🧢", name: "Gorra",      cost: 5 },
]

export const findAccessory = (id: string | null): Accessory | null =>
  id ? ACCESSORIES.find((a) => a.id === id) ?? null : null
