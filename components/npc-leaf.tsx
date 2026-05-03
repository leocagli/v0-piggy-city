'use client'

import Image from 'next/image'

interface NPCLeafProps {
  x: number // Grid X position (0-24)
  y: number // Grid Y position (0-18)
  cellW: number // Cell width as percentage
  cellH: number // Cell height as percentage
}

export function NPCLeaf({ x, y, cellW, cellH }: NPCLeafProps) {
  const screenX = (x + 0.5) * cellW
  const screenY = (y + 0.5) * cellH
  const npcSize = Math.max(40, cellW * 1.6) // NPC scales with cells

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${screenX}%`,
        top: `${screenY}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        style={{
          width: npcSize,
          height: npcSize,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))',
        }}
      >
        <Image
          src="/npc-leaf.png"
          alt="Leaf NPC"
          width={npcSize}
          height={npcSize}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
          priority
          draggable={false}
        />
      </div>

      {/* Idle animation float */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .npc-leaf-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
