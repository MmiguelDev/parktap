import type { Cajon, Chip } from './types'

// UID de ejemplo. Reemplázalos con el serialNumber real de cada chip.
// 5 cajones normales, 2 accesibles (A-01 y A-02) y 1 chip de repuesto (B-02).
export const chips: Chip[] = [
  { uid: '04:00:00:00:00:A1', cajonId: 'A-01' },
  { uid: '04:00:00:00:00:A2', cajonId: 'A-02' },
  { uid: '04:00:00:00:00:A3', cajonId: 'A-03' },
  { uid: '04:00:00:00:00:A4', cajonId: 'A-04' },
  { uid: '04:00:00:00:00:A5', cajonId: 'A-05' },
  { uid: '04:00:00:00:00:B1', cajonId: 'B-01' },
  { uid: '04:00:00:00:00:B3', cajonId: 'B-03' },
  { uid: '04:00:00:00:00:R1', cajonId: 'B-02', repuesto: true }
]

const porUid = new Map(chips.map((chip) => [chip.uid.toUpperCase(), chip.cajonId]))

export function cajonDeUid(uid: string): string | undefined {
  return porUid.get(uid.trim().toUpperCase())
}

export function uidDeCajon(cajonId: string): string | undefined {
  return chips.find((chip) => chip.cajonId === cajonId)?.uid
}

export function cajonesIniciales(): Cajon[] {
  const lista: Cajon[] = []
  for (const fila of ['A', 'B']) {
    for (let numero = 1; numero <= 6; numero += 1) {
      const id = `${fila}-0${numero}`
      lista.push({
        id,
        accesible: id === 'A-01' || id === 'A-02',
        estado: 'libre',
        ocupante: null,
        desde: null
      })
    }
  }
  return lista
}
