"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { X, Send, MessageCircle } from "lucide-react"

interface NPCChatProps {
  npcId: string
  npcName: string
  npcColor: string
  onClose: () => void
}

export function NPCChat({ npcId, npcName, npcColor, onClose }: NPCChatProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/npc-chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: { messages, npcId, id },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(20,12,6,0.85)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col"
        style={{
          width: "min(420px, 92vw)",
          maxHeight: "80vh",
          background: "#f5e6d3",
          border: "5px solid #4e342e",
          borderRadius: "8px",
          boxShadow: "inset -4px -4px 0 #d7ccc8, inset 4px 4px 0 #fff8e1, 0 12px 48px rgba(0,0,0,0.5), 0 6px 0 #3e2723",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: npcColor,
            borderBottom: "4px solid #4e342e",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageCircle style={{ width: 20, height: 20, color: "#fff" }} strokeWidth={2.5} />
            <span style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}>
              {npcName}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#c62828",
              border: "3px solid #4e342e",
              borderRadius: "4px",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "inset -2px -2px 0 #b71c1c, inset 2px 2px 0 #ef5350",
            }}
            aria-label="Cerrar chat"
          >
            <X style={{ width: 14, height: 14, color: "#fff" }} strokeWidth={3} />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 200,
            maxHeight: "50vh",
            background: "#faf6f0",
          }}
        >
          {messages.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "24px 16px",
              color: "#8d6e63",
              fontSize: "13px",
              fontStyle: "italic",
            }}>
              Escribe un mensaje para hablar con {npcName}
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user"
            const text = message.parts
              ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("") || ""

            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    background: isUser ? npcColor : "#fff",
                    color: isUser ? "#fff" : "#4e342e",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    border: isUser ? "none" : "2px solid #e0d6cc",
                    boxShadow: isUser
                      ? "0 2px 8px rgba(0,0,0,0.2)"
                      : "0 2px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  {text}
                </div>
              </div>
            )
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px 12px 12px 4px",
                  background: "#fff",
                  border: "2px solid #e0d6cc",
                  color: "#8d6e63",
                  fontSize: "13px",
                }}
              >
                <span className="animate-pulse">Escribiendo...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: 8,
            padding: "12px",
            borderTop: "3px solid #e0d6cc",
            background: "#f5e6d3",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "3px solid #4e342e",
              borderRadius: "6px",
              fontSize: "13px",
              background: "#fff",
              color: "#4e342e",
              outline: "none",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isLoading || !input.trim() ? "#bcaaa4" : npcColor,
              border: "3px solid #4e342e",
              borderRadius: "6px",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              boxShadow: "inset -2px -2px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.2)",
              transition: "background 0.15s ease",
            }}
          >
            <Send style={{ width: 18, height: 18, color: "#fff" }} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  )
}
