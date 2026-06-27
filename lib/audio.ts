// lib/audio.ts — zero-dependency procedural Web Audio. SSR-safe: nothing here
// touches window/AudioContext at module-eval time. Mute state is driven by the
// component (which persists it via game-storage); this module is pure sound.

class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null // SFX bus
  private ambGain: GainNode | null = null // ambient bus
  private ambFilter: BiquadFilterNode | null = null
  private muted = false
  private unlocked = false
  // ambient scheduler
  private schedTimer: ReturnType<typeof setInterval> | null = null
  private nextNoteTime = 0
  private step = 0
  // Track osc -> gain so dispose() can disconnect gains explicitly (a suspended
  // context may never fire `onended`, which would otherwise leave gains connected).
  private liveNotes = new Map<OscillatorNode, GainNode>()

  getMuted() { return this.muted }

  // Idempotent — safe to call on every keydown/pointerdown.
  unlock() {
    if (typeof window === "undefined") return
    if (this.unlocked && this.ctx) {
      this.ctx.resume().then(() => { if (!this.muted) this.startAmbient() }).catch(() => {})
      return
    }
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined
    if (!AC) return
    if (!this.ctx) {
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.9
      this.master.connect(this.ctx.destination)

      this.ambFilter = this.ctx.createBiquadFilter()
      this.ambFilter.type = "lowpass"
      this.ambFilter.frequency.value = 900
      this.ambGain = this.ctx.createGain()
      this.ambGain.gain.value = this.muted ? 0 : 0.06
      this.ambFilter.connect(this.ambGain)
      this.ambGain.connect(this.ctx.destination)
    }
    // iOS warm-up: play one silent sample buffer inside the gesture
    try {
      const b = this.ctx.createBuffer(1, 1, 22050)
      const s = this.ctx.createBufferSource()
      s.buffer = b
      s.connect(this.ctx.destination)
      s.start(0)
    } catch {}
    this.unlocked = true
    // resume() is async; only arm the ambient pad once the ctx is actually running
    this.ctx.resume().then(() => { if (!this.muted) this.startAmbient() }).catch(() => {})
  }

  setMuted(m: boolean) {
    this.muted = m
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.master?.gain.setTargetAtTime(m ? 0 : 0.9, t, 0.02)
    this.ambGain?.gain.setTargetAtTime(m ? 0 : 0.06, t, 0.05)
    if (m) this.stopAmbient()
    else if (this.unlocked) this.startAmbient()
  }

  toggleMuted() { this.setMuted(!this.muted); return this.muted }

  // ── envelope helper: one short osc note through the SFX bus ──
  private blip(freq: number, start: number, dur: number, type: OscillatorType = "square", peak = 0.25) {
    if (!this.ctx || !this.master || this.muted) return
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(peak, start + 0.012) // fast attack
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur) // decay
    osc.connect(g)
    g.connect(this.master)
    osc.start(start)
    osc.stop(start + dur + 0.02)
    this.liveNotes.set(osc, g)
    osc.onended = () => { this.liveNotes.delete(osc); g.disconnect() }
  }

  // bright rising arpeggio (coin pickup)
  coin() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    ;[988, 1319, 1568].forEach((f, i) => this.blip(f, t + i * 0.06, 0.12, "square", 0.22)) // B5 E6 G6
  }

  // gentle 3-note chime (zone enter)
  zoneEnter() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    ;[523.25, 659.25, 783.99].forEach((f, i) => this.blip(f, t + i * 0.08, 0.5, "sine", 0.18)) // C5 E5 G5
  }

  // very short, very quiet click — call throttled from the rAF loop
  footstep() {
    if (!this.ctx) return
    this.blip(180 + Math.random() * 40, this.ctx.currentTime, 0.05, "triangle", 0.05)
  }

  // little flourish (all coins collected)
  fanfare() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const seq: [number, number][] = [
      [523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.5], [1047, 0.62],
    ]
    seq.forEach(([f, dt]) => this.blip(f, t + dt, 0.28, "square", 0.2))
  }

  // ── ambient cozy pad (look-ahead scheduler) ──
  // I  vi IV V  in C, slow. Two notes per chord (root + a color tone).
  private chords: number[][] = [
    [261.63, 329.63], // C  (C4 E4)
    [220.0, 261.63], // Am (A3 C4)
    [174.61, 220.0], // F  (F3 A3)
    [196.0, 246.94], // G  (G3 B3)
  ]
  private startAmbient() {
    // Require a live, gesture-resumed context — never arm against a suspended ctx.
    if (!this.ctx || this.ctx.state !== "running" || this.schedTimer || this.muted) return
    this.nextNoteTime = this.ctx.currentTime + 0.1
    this.step = 0
    this.schedTimer = setInterval(() => this.scheduler(), 25)
  }
  private stopAmbient() {
    if (this.schedTimer) { clearInterval(this.schedTimer); this.schedTimer = null }
  }
  private scheduler() {
    if (!this.ctx || !this.ambFilter) return
    const LOOKAHEAD = 0.1
    const NOTE_LEN = 2.2 // seconds per chord — slow & cozy
    while (this.nextNoteTime < this.ctx.currentTime + LOOKAHEAD) {
      const chord = this.chords[this.step % this.chords.length]
      for (const f of chord) this.padNote(f, this.nextNoteTime, NOTE_LEN)
      this.nextNoteTime += NOTE_LEN
      this.step++
    }
  }
  private padNote(freq: number, start: number, dur: number) {
    if (!this.ctx || !this.ambFilter) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = "triangle"
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.0001, start)
    g.gain.linearRampToValueAtTime(0.5, start + dur * 0.4) // slow swell
    g.gain.linearRampToValueAtTime(0.0001, start + dur)
    osc.connect(g)
    g.connect(this.ambFilter)
    osc.start(start)
    osc.stop(start + dur + 0.05)
    this.liveNotes.set(osc, g)
    osc.onended = () => { this.liveNotes.delete(osc); g.disconnect() }
  }

  // ── lifecycle ──
  dispose() {
    this.stopAmbient()
    // Disconnect both osc and gain explicitly — don't rely on onended (a suspended
    // context may never dispatch it, leaving gains connected).
    for (const [o, g] of this.liveNotes) {
      o.onended = null
      try { o.stop() } catch {}
      try { o.disconnect() } catch {}
      try { g.disconnect() } catch {}
    }
    this.liveNotes.clear()
    if (this.ctx && this.ctx.state !== "closed") void this.ctx.suspend()
    // keep ctx + unlocked so a remount can resume the SAME context
  }
}

// Module singleton, stashed on globalThis so Fast Refresh / StrictMode double-mount
// don't create multiple AudioContexts (browsers cap ~6 and warn).
const g = globalThis as unknown as { __piggyAudio?: AudioManager }
export const audio: AudioManager = g.__piggyAudio ?? (g.__piggyAudio = new AudioManager())
