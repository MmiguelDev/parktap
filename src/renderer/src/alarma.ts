import { useEffect } from 'react'

// Pitido con Web Audio: no necesita archivos de sonido.
let contexto: AudioContext | null = null

function pitar(): void {
  contexto ??= new AudioContext()
  const ctx = contexto
  if (ctx.state === 'suspended') void ctx.resume()
  ;[0, 0.25].forEach((inicio) => {
    const osc = ctx.createOscillator()
    const volumen = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 880
    volumen.gain.value = 0.15
    osc.connect(volumen).connect(ctx.destination)
    const t = ctx.currentTime + inicio
    osc.start(t)
    osc.stop(t + 0.15)
  })
}

// Pita cada segundo mientras haya algún cajón en infracción.
// Se calla solo cuando el auto se quita (el cajón queda libre).
export function useAlarma(activa: boolean): void {
  useEffect(() => {
    if (!activa) return
    pitar()
    const intervalo = window.setInterval(pitar, 1000)
    return () => window.clearInterval(intervalo)
  }, [activa])
}
