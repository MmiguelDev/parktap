import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { chipsEjemplo, establecerChips, obtenerChips } from '../shared/cajones'
import type { Chip } from '../shared/types'

// Los chips reales se guardan en data/chips.json, en la raíz del proyecto,
// para subirlos a git y que todo el equipo use los mismos UID.
const carpeta = join(process.cwd(), 'data')
const archivo = join(carpeta, 'chips.json')

export function cargarChips(): Chip[] {
  if (existsSync(archivo)) {
    try {
      const lista = JSON.parse(readFileSync(archivo, 'utf8')) as Chip[]
      if (Array.isArray(lista)) {
        establecerChips(lista)
        console.log(`[parktap] ${lista.length} chips cargados de data/chips.json`)
        return obtenerChips()
      }
    } catch (error) {
      console.error('[parktap] No se pudo leer data/chips.json, uso los chips de ejemplo', error)
    }
  }
  establecerChips(chipsEjemplo)
  return obtenerChips()
}

export function guardarChips(): void {
  mkdirSync(carpeta, { recursive: true })
  writeFileSync(archivo, JSON.stringify(obtenerChips(), null, 2) + '\n', 'utf8')
}
