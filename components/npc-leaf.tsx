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

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${screenX}%`,
        top: `${screenY}%`,
        width: `${cellW * 2}%`,
        height: `${cellH * 2}%`,
        transform: 'translate(-50%, -62%)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src="/npc-leaf.png"
          alt="Leaf NPC"
          fill
          style={{
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
          50% { transform: translateY(-8px); }
        }
        .npc-leaf-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
