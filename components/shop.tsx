"use client"

import { X, Coins, Check } from "lucide-react"
import { ACCESSORIES } from "@/lib/accessories"

interface ShopProps {
  wallet: number
  owned: string[]
  equipped: string | null
  onBuy: (id: string) => void
  onEquip: (id: string) => void
  onUnequip: () => void
  onClose: () => void
}

// Pet-shop style modal: buy accessories with collected coins, equip/unequip.
// Visual style mirrors the existing minimap modal (wooden frame).
export function Shop({ wallet, owned, equipped, onBuy, onEquip, onUnequip, onClose }: ShopProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(20,12,6,0.82)" }}
      onClick={onClose}
    >
      <div
        className="relative"
        style={{
          width: "min(92vw, 460px)",
          maxHeight: "90vh",
          border: "5px solid #4e342e",
          borderRadius: "6px",
          background: "#fffdf6",
          boxShadow: "inset -4px -4px 0 #3e2723, inset 4px 4px 0 #8d6e63, 0 12px 48px rgba(0,0,0,0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          style={{
            background: "#5d4037",
            borderBottom: "4px solid #4e342e",
            boxShadow: "inset 0 -2px 0 #3e2723, inset 0 2px 0 #8d6e63",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ color: "#fff8e1", fontWeight: 800, fontSize: 13, letterSpacing: "1px", textTransform: "uppercase" }}>
            Tienda de Piggy
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "#fffdf6", border: "2px solid #4e342e", borderRadius: 3,
                padding: "2px 8px", fontWeight: 900, color: "#b45309", fontSize: 12,
              }}
            >
              <Coins style={{ width: 13, height: 13 }} strokeWidth={2.5} />
              {wallet}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar tienda"
              style={{
                background: "#c62828", border: "3px solid #4e342e", borderRadius: 3,
                width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "inset -2px -2px 0 #b71c1c, inset 2px 2px 0 #ef5350", flexShrink: 0,
              }}
            >
              <X style={{ width: 13, height: 13, color: "#fff8e1" }} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ padding: 10, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ACCESSORIES.map((a) => {
            const isOwned = owned.includes(a.id)
            const isEquipped = equipped === a.id
            const canAfford = wallet >= a.cost
            return (
              <div
                key={a.id}
                style={{
                  background: isEquipped ? "#fff3d6" : "#fbf6ea",
                  border: `3px solid ${isEquipped ? "#b45309" : "#8d6e63"}`,
                  borderRadius: 6,
                  padding: "8px 8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  boxShadow: "0 3px 0 #3e2723",
                }}
              >
                <div style={{ fontSize: 30, lineHeight: 1 }}>{a.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 11, color: "#4e342e" }}>{a.name}</div>

                {!isOwned ? (
                  <button
                    onClick={() => canAfford && onBuy(a.id)}
                    disabled={!canAfford}
                    style={{
                      marginTop: 2,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      background: canAfford ? "#ffcc02" : "#e0d6c4",
                      color: "#4e342e",
                      border: "2px solid #4e342e",
                      borderRadius: 4,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: canAfford ? "pointer" : "not-allowed",
                      opacity: canAfford ? 1 : 0.6,
                      boxShadow: "0 2px 0 #3e2723",
                    }}
                  >
                    <Coins style={{ width: 12, height: 12 }} strokeWidth={2.5} />
                    {a.cost}
                  </button>
                ) : isEquipped ? (
                  <button
                    onClick={onUnequip}
                    style={{
                      marginTop: 2,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                      background: "#b45309", color: "#fff8e1",
                      border: "2px solid #4e342e", borderRadius: 4,
                      padding: "3px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer",
                      boxShadow: "0 2px 0 #3e2723",
                    }}
                  >
                    <Check style={{ width: 12, height: 12 }} strokeWidth={3} />
                    Quitar
                  </button>
                ) : (
                  <button
                    onClick={() => onEquip(a.id)}
                    style={{
                      marginTop: 2,
                      background: "#2d8a4e", color: "#fff8e1",
                      border: "2px solid #4e342e", borderRadius: 4,
                      padding: "3px 12px", fontSize: 10, fontWeight: 800, cursor: "pointer",
                      boxShadow: "0 2px 0 #3e2723",
                    }}
                  >
                    Equipar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
