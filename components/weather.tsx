"use client"

import { memo, useMemo, type CSSProperties } from "react"

export type WeatherType = "clear" | "rain" | "snow"

// Particle weather overlay (rain / snow) + an atmospheric tint so the weather
// reads clearly over the colourful map. Pure CSS — GPU-composited, zero deps.
// Keyframes are injected inline (NPC-component pattern) to be HMR/processor proof.
// Client-only: weather starts "clear" so SSR and first client paint render nothing.
export const Weather = memo(function Weather({ type }: { type: WeatherType }) {
  const particles = useMemo(() => {
    if (type === "clear") return []
    const n = type === "rain" ? 90 : 70
    return Array.from({ length: n }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * (type === "rain" ? 0.9 : 5),
      dur: type === "rain" ? 0.45 + Math.random() * 0.4 : 4.5 + Math.random() * 5,
      size: type === "rain" ? 0 : 4 + Math.random() * 5,
      drift: (Math.random() - 0.5) * 60,
      opacity: type === "rain" ? 0.45 + Math.random() * 0.45 : 0.55 + Math.random() * 0.4,
    }))
  }, [type])

  if (type === "clear") return null

  // Atmospheric tint — the strongest visual cue that weather is active.
  const tint = type === "rain" ? "rgba(54,74,116,0.24)" : "rgba(205,222,255,0.16)"

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 38 }}>
      <div className="absolute inset-0" style={{ background: tint }} />
      {particles.map((p, i) =>
        type === "rain" ? (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "-12%",
              left: `${p.left}%`,
              width: 2.5,
              height: `${16 + p.dur * 16}px`,
              background: "linear-gradient(to bottom, rgba(225,238,255,0), rgba(225,238,255,0.95))",
              opacity: p.opacity,
              animation: `rain-fall ${p.dur}s linear ${p.delay}s infinite`,
            }}
          />
        ) : (
          <div
            key={i}
            style={
              {
                position: "absolute",
                top: "-6%",
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 0 4px rgba(255,255,255,0.9)",
                opacity: p.opacity,
                "--drift": `${p.drift}px`,
                animation: `snow-fall ${p.dur}s linear ${p.delay}s infinite`,
              } as CSSProperties
            }
          />
        )
      )}
      {/* Inline keyframes so they're guaranteed present regardless of CSS processing/HMR. */}
      <style>{`
        @keyframes rain-fall { to { transform: translateY(115vh); } }
        @keyframes snow-fall { to { transform: translate(var(--drift, 0px), 112vh); } }
      `}</style>
    </div>
  )
})
