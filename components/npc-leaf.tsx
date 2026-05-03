'use client'

import Image from 'next/image'

interface NPCLeafProps {
  x: number // Grid X position (0-24)
  y: number // Grid Y position (0-18)
  cellW: number // Cell width as percentage
  cellH: number // Cell height as percentage
  isNearby?: boolean // Whether Piggy is nearby
}

export function NPCLeaf({ x, y, cellW, cellH, isNearby = false }: NPCLeafProps) {
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
      {/* Chat bubble - appears when Piggy is nearby */}
      {isNearby && (
        <div
          style={{
            position: 'absolute',
            bottom: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 'clamp(140px, 20vw, 180px)',
            maxWidth: 'clamp(160px, 25vw, 220px)',
            zIndex: 30,
          }}
        >
          {/* Bubble body */}
          <div
            style={{
              background: '#fffdf6',
              border: '3px solid #2d5a27',
              borderRadius: '8px',
              padding: 'clamp(6px, 1.5vw, 10px)',
              boxShadow: '0 4px 0 #1a3d17, inset 0 -2px 0 rgba(0,0,0,0.05)',
              position: 'relative',
            }}
          >
            {/* NPC name tag */}
            <div
              style={{
                background: '#4ade80',
                border: '2px solid #2d5a27',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: 'clamp(8px, 1.2vw, 10px)',
                fontWeight: 800,
                color: '#14532d',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '4px',
                boxShadow: '0 2px 0 #22c55e',
              }}
            >
              Leafy
            </div>
            
            {/* Message text */}
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(9px, 1.4vw, 12px)',
                fontWeight: 600,
                color: '#3d2914',
                lineHeight: 1.35,
              }}
            >
              Bienvenido a la zona Naturaleza! Aqui encontraras cascadas, arboles y toda la magia del bosque.
            </p>
          </div>
          
          {/* Bubble tail/pointer */}
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #2d5a27',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fffdf6',
            }}
          />
        </div>
      )}

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

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bubble-pop {
          0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
