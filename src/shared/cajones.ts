import type { Cajon, Chip, TipoCajon } from './types'

// Lote de la demo: 4 cajones, cada uno con su chip NFC pegado.
export const LOTE: { id: string; tipo: TipoCajon }[] = [
  { id: 'A-01', tipo: 'accesible' },
  { id: 'A-02', tipo: 'maestro' },
  { id: 'A-03', tipo: 'alumno' },
  { id: 'A-04', tipo: 'alumno' }
]

export const NOMBRE_TIPO: Record<TipoCajon, string> = {
  accesible: 'Accesible',
  maestro: 'Maestros',
  alumno: 'Alumnos'
}

// UID de ejemplo. Los reales se registran desde el celular ("Registrar chip")
// y se guardan en data/chips.json. Esta lista solo se usa si ese archivo no existe.
export const chipsEjemplo: Chip[] = LOTE.map((cajon, indice) => ({
  uid: `04:00:00:00:00:A${indice + 1}`,
  cajonId: cajon.id
}))

const IDS_LOTE = new Set(LOTE.map((cajon) => cajon.id))

export function esCajonValido(id: string): boolean {
  return IDS_LOTE.has(id)
}

export function normalizarUid(uid: string): string {
  return uid.trim().toUpperCase()
}

let chips: Chip[] = []
let porUid = new Map<string, string>()

export function establecerChips(lista: Chip[]): void {
  chips = lista.map((chip) => ({ ...chip, uid: normalizarUid(chip.uid) }))
  porUid = new Map(chips.map((chip) => [chip.uid, chip.cajonId]))
}

export function obtenerChips(): Chip[] {
  return chips
}

// Un chip va en un solo cajón y un cajón tiene un solo chip:
// se quitan las asignaciones anteriores de ese chip y de ese cajón.
export function registrarChip(uid: string, cajonId: string): Chip[] {
  const limpio = normalizarUid(uid)
  const siguientes = chips.filter((chip) => chip.uid !== limpio && chip.cajonId !== cajonId)
  siguientes.push({ uid: limpio, cajonId })
  siguientes.sort((a, b) => a.cajonId.localeCompare(b.cajonId))
  establecerChips(siguientes)
  return chips
}

establecerChips(chipsEjemplo)

export function cajonDeUid(uid: string): string | undefined {
  const limpio = normalizarUid(uid)
  if (limpio.startsWith('SIM:')) {
    const id = limpio.slice(4)
    return esCajonValido(id) ? id : undefined
  }
  return porUid.get(limpio)
}

export function uidParaSimulacion(cajonId: string): string {
  return uidDeCajon(cajonId) ?? `SIM:${cajonId}`
}

export function uidDeCajon(cajonId: string): string | undefined {
  return chips.find((chip) => chip.cajonId === cajonId)?.uid
}

export function cajonesIniciales(): Cajon[] {
  return LOTE.map(({ id, tipo }) => ({
    id,
    tipo,
    accesible: tipo === 'accesible',
    estado: 'libre',
    ocupante: null,
    desde: null,
    infraccion: false,
    motivoInfraccion: null
  }))
}
