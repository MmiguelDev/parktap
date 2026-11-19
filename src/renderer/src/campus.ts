import type { Cajon, TipoCajon } from '../../shared/types'

export type Zona = {
  id: string
  name: string
  tipo: 'est' | 'per'
  cap: number
  occ: number
  shape: 'path' | 'rect'
  d?: string
  r?: [number, number, number, number]
  demo?: boolean
}

export const zonas: Zona[] = [
  {
    id: 'norte',
    name: 'Lote Norte P–O',
    tipo: 'est',
    cap: 220,
    occ: 176,
    shape: 'path',
    d: 'M0 235 L240 240 L246 345 L168 385 L152 455 L60 380 L0 330 Z'
  },
  {
    id: 'em',
    name: 'Lote E–M',
    tipo: 'est',
    cap: 4,
    occ: 0,
    shape: 'rect',
    r: [340, 418, 76, 80],
    demo: true
  },
  {
    id: 'moe',
    name: 'Lote M Oriente',
    tipo: 'est',
    cap: 40,
    occ: 31,
    shape: 'rect',
    r: [500, 428, 56, 62]
  },
  {
    id: 'sur',
    name: 'Lote Sur I–K',
    tipo: 'est',
    cap: 200,
    occ: 118,
    shape: 'path',
    d: 'M575 690 L780 672 L786 752 L748 806 L575 770 Z'
  },
  {
    id: 'cg',
    name: 'Franja C–G',
    tipo: 'est',
    cap: 30,
    occ: 28,
    shape: 'path',
    d: 'M384 640 L394 640 L394 712 L522 712 L522 724 L384 724 Z'
  },
  {
    id: 'pB',
    name: 'Personal B',
    tipo: 'per',
    cap: 20,
    occ: 15,
    shape: 'rect',
    r: [210, 550, 46, 46]
  },
  {
    id: 'pF',
    name: 'Personal F',
    tipo: 'per',
    cap: 16,
    occ: 9,
    shape: 'rect',
    r: [332, 540, 54, 32]
  },
  {
    id: 'pD',
    name: 'Personal D–C',
    tipo: 'per',
    cap: 14,
    occ: 12,
    shape: 'rect',
    r: [398, 634, 36, 48]
  },
  {
    id: 'pE',
    name: 'Personal E',
    tipo: 'per',
    cap: 12,
    occ: 6,
    shape: 'rect',
    r: [252, 405, 18, 62]
  },
  {
    id: 'pL',
    name: 'Personal L',
    tipo: 'per',
    cap: 40,
    occ: 22,
    shape: 'path',
    d: 'M592 470 L640 470 L652 545 L612 548 L578 520 Z'
  },
  {
    id: 'pR',
    name: 'Personal R',
    tipo: 'per',
    cap: 30,
    occ: 27,
    shape: 'rect',
    r: [682, 432, 54, 70]
  }
]

const edificios: [string, number, number, number, number][] = [
  ['P', 90, 275, 62, 72],
  ['O', 170, 295, 60, 70],
  ['S', 265, 240, 52, 70],
  ['J', 266, 352, 28, 30],
  ['N', 165, 395, 50, 62],
  ['E', 285, 415, 46, 64],
  ['M', 446, 410, 40, 86],
  ['L', 604, 448, 30, 30],
  ['R', 686, 508, 48, 46],
  ['B', 280, 540, 40, 76],
  ['A', 230, 602, 40, 92],
  ['F', 340, 580, 40, 50],
  ['D', 405, 552, 42, 62],
  ['C', 335, 650, 42, 70],
  ['G', 470, 605, 42, 82],
  ['I', 556, 548, 40, 82],
  ['K', 612, 562, 44, 82],
  ['Q', 218, 716, 30, 26],
  ['H', 268, 722, 40, 24]
]

const horas = [18, 46, 78, 92, 96, 88, 70, 74, 85, 60, 34, 15]
const marcas = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

export function colorNivel(porcentaje: number): string {
  if (porcentaje >= 0.9) return 'var(--alert)'
  if (porcentaje >= 0.7) return 'var(--warn)'
  return 'var(--free)'
}

function forma(zona: Zona, extra = ''): string {
  if (zona.shape === 'rect' && zona.r) {
    const [x, y, w, h] = zona.r
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="currentColor" stroke="currentColor" stroke-width="2" ${extra}/>`
  }
  return `<path d="${zona.d}" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" ${extra}/>`
}

function centro(zona: Zona): [number, number] {
  if (zona.shape === 'rect' && zona.r) return [zona.r[0] + zona.r[2] / 2, zona.r[1] + zona.r[3] / 2]
  const numeros = (zona.d ?? '').match(/[\d.]+/g)?.map(Number) ?? []
  let x = 0
  let y = 0
  for (let i = 0; i < numeros.length; i += 2) {
    x += numeros[i]
    y += numeros[i + 1]
  }
  const puntos = numeros.length / 2 || 1
  return [x / puntos, y / puntos]
}

export function svgCampus(lista: Zona[], seleccion: string): string {
  let svg = `<svg viewBox="0 225 800 600" role="img" aria-label="Croquis del campus UTCH con estacionamientos"><rect x="0" y="225" width="800" height="600" fill="var(--ground)"/>`
  svg += `<path d="M0 470 L40 515 L185 525 M40 515 L160 820 L780 820 L740 790" fill="none" stroke="var(--road)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`
  svg += `<path d="M185 520 L620 520" fill="none" stroke="var(--road)" stroke-width="14" stroke-linecap="round"/>`
  svg += `<circle cx="240" cy="518" r="18" fill="none" stroke="var(--road)" stroke-width="10"/><circle cx="522" cy="518" r="18" fill="none" stroke="var(--road)" stroke-width="10"/>`
  svg += `<text x="70" y="660" transform="rotate(68 70 660)" font-size="14" font-weight="700" fill="var(--muted)" font-family="var(--font)">AV. CANTERA</text>`
  ;[
    [178, 512, '1'],
    [770, 780, '2']
  ].forEach(([x, y, n]) => {
    svg += `<g><circle cx="${x}" cy="${y}" r="13" fill="var(--alert)"/><text x="${x}" y="${Number(y) + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--on-primary)" font-family="var(--font)">${n}</text></g>`
  })
  svg += `<text x="128" y="500" font-size="11" font-weight="700" fill="var(--muted)" font-family="var(--font)">ACCESO 1</text><text x="700" y="800" font-size="11" font-weight="700" fill="var(--muted)" font-family="var(--font)">ACCESO 2</text>`
  lista.forEach((zona) => {
    const porcentaje = zona.occ / zona.cap
    const color = colorNivel(porcentaje)
    const [cx, cy] = centro(zona)
    const opacidad = zona.tipo === 'per' ? 0.35 : 0.55
    const trazo = zona.tipo === 'per' ? 'stroke-dasharray="5 4"' : ''
    svg += `<g class="zone${zona.id === seleccion ? ' sel' : ''}" data-z="${zona.id}" tabindex="0" role="button" aria-label="${zona.name}: ${zona.cap - zona.occ} libres de ${zona.cap}" style="color:${color}">
      ${forma(zona, `${trazo} fill-opacity="${opacidad}"`)}
      ${
        zona.cap >= 20 || zona.demo
          ? `<g><rect x="${cx - 24}" y="${cy - 11}" width="48" height="22" rx="11" fill="var(--surface)" stroke="${color}"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text)" font-family="var(--font)">${Math.round(porcentaje * 100)}%</text></g>`
          : ''
      }
      ${zona.demo ? `<text x="${cx}" y="${cy - 18}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--text)" font-family="var(--font)">NFC DEMO</text>` : ''}
    </g>`
  })
  edificios.forEach(([nombre, x, y, w, h]) => {
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--bldg)" stroke="var(--border)" pointer-events="none"/><text x="${x + w / 2}" y="${y + h / 2 + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="var(--bldg-text)" font-family="var(--font)">${nombre}</text>`
  })
  return `${svg}</svg>`
}

function auto(x: number, y: number, w: number, h: number, voltear: boolean): string {
  return `<g transform="translate(${x},${y})${voltear ? ` rotate(180 ${w / 2} ${h / 2})` : ''}">
    <rect x="${w * 0.2}" y="${h * 0.1}" width="${w * 0.6}" height="${h * 0.8}" rx="${w * 0.15}" fill="var(--car)" stroke="rgba(0,0,0,.3)"/>
    <rect x="${w * 0.27}" y="${h * 0.22}" width="${w * 0.46}" height="${h * 0.14}" rx="4" fill="rgba(0,0,0,.55)"/>
    <rect x="${w * 0.27}" y="${h * 0.66}" width="${w * 0.46}" height="${h * 0.1}" rx="4" fill="rgba(0,0,0,.35)"/></g>`
}

function silla(cx: number, cy: number): string {
  return `<g transform="translate(${cx - 12},${cy - 12})" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="4" r="2" fill="#fff" stroke="none"/><path d="M12 7v6h5l2 5"/><path d="M9 10a6 6 0 1 0 6 8"/></g>`
}

const COLOR_TIPO: Record<Cajon['tipo'], string> = {
  alumno: 'var(--free)',
  maestro: 'var(--staff)',
  accesible: 'var(--acc)'
}

const ETIQUETA_TIPO: Record<Cajon['tipo'], string> = {
  alumno: 'ALUMNOS',
  maestro: 'MAESTROS',
  accesible: 'ACCESIBLE'
}

// Lote de la demo visto desde arriba. Una fila de cajones (A-01 a A-04) y el carril debajo.
export function svgLote(cajones: Cajon[], placaDe: (id: string | null) => string | null): string {
  const ancho = 760
  const altoCajon = 170
  const alto = altoCajon + 120
  const n = Math.max(cajones.length, 1)
  const hueco = (ancho - 16 * (n + 1)) / n
  const carril = altoCajon + 60
  let svg = `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Lote E–M, ${cajones.length} cajones"><rect width="${ancho}" height="${alto}" fill="var(--asphalt)"/>`
  for (let x = 20; x < ancho; x += 60) {
    svg += `<rect x="${x}" y="${carril - 2}" width="30" height="4" fill="var(--line)" opacity=".7"/>`
  }
  svg += `<path d="M${ancho - 80} ${carril - 24} l24 0 l0 -8 l16 14 l-16 14 l0 -8 l-24 0z" fill="var(--line)" opacity=".55"/>`
  svg += `<text x="16" y="${carril + 30}" fill="var(--line)" opacity=".75" font-size="13" font-weight="700" font-family="var(--font)">← EDIFICIO E</text><text x="${ancho - 16}" y="${carril + 30}" text-anchor="end" fill="var(--line)" opacity=".75" font-size="13" font-weight="700" font-family="var(--font)">EDIFICIO M →</text>`
  cajones.forEach((cajon, indice) => {
    const x = 16 + indice * (hueco + 16)
    const y = 16
    const ocupado = cajon.estado === 'ocupado'
    const colorTipo = COLOR_TIPO[cajon.tipo]
    const color = cajon.infraccion ? 'var(--alert)' : ocupado ? 'var(--busy)' : colorTipo
    const opacidad = ocupado && !cajon.infraccion ? 0.4 : 0.25
    const estado = ocupado ? 'OCUPADO' : 'LIBRE'
    svg += `<g class="spot${cajon.infraccion ? ' blink' : ''}" data-id="${cajon.id}" tabindex="0" role="button" aria-label="Cajón ${cajon.id}, ${ETIQUETA_TIPO[cajon.tipo].toLowerCase()}, ${estado.toLowerCase()}">
      <rect x="${x}" y="${y}" width="${hueco}" height="${altoCajon}" rx="8" fill="${color}" opacity="${opacidad}" stroke="${color}" stroke-width="3"/>
      <rect x="${x}" y="${y}" width="${hueco}" height="8" rx="4" fill="${colorTipo}"/>`
    if (cajon.tipo === 'accesible' && !ocupado) {
      svg += `<rect class="acc-mark" x="${x + hueco / 2 - 18}" y="${y + altoCajon / 2 - 18}" width="36" height="36" rx="6" fill="var(--acc)"/>${silla(x + hueco / 2, y + altoCajon / 2)}`
    }
    if (ocupado) svg += auto(x, y + 14, hueco, altoCajon - 28, false)
    svg += `<text x="${x + 10}" y="${y + 30}" fill="var(--line)" font-size="15" font-weight="800" font-family="var(--font)">${cajon.id}</text>`
    svg += `<text x="${x + hueco - 10}" y="${y + 30}" text-anchor="end" fill="${colorTipo}" font-size="11" font-weight="800" font-family="var(--font)">${ETIQUETA_TIPO[cajon.tipo]}</text>`
    const placa = placaDe(cajon.ocupante)
    const pie = cajon.infraccion ? `SIN PERMISO · ${placa ?? ''}` : (placa ?? estado)
    svg += `<rect x="${x + 8}" y="${y + altoCajon - 34}" width="${hueco - 16}" height="24" rx="12" fill="var(--surface)" opacity=".92"/>`
    svg += `<text x="${x + hueco / 2}" y="${y + altoCajon - 17}" text-anchor="middle" fill="${cajon.infraccion ? 'var(--alert)' : ocupado ? 'var(--text)' : colorTipo}" font-size="${cajon.infraccion ? 11 : 12}" font-weight="800" font-family="var(--font)">${pie}</text>`
    svg += `</g>`
  })
  return `${svg}</svg>`
}

export function svgGrafica(): string {
  const ancho = 520
  const alto = 180
  const paso = ancho / horas.length
  let svg = `<svg viewBox="0 0 ${ancho} ${alto + 24}" style="width:100%;height:auto" role="img" aria-label="Ocupación del campus por hora; pico de 96% a las 11">`
  ;[0, 50, 100].forEach((valor) => {
    const y = alto - (valor / 100) * (alto - 10)
    svg += `<line x1="0" x2="${ancho}" y1="${y}" y2="${y}" stroke="var(--border)"/><text x="${ancho - 2}" y="${y - 4}" text-anchor="end" font-size="11" fill="var(--muted)">${valor}%</text>`
  })
  horas.forEach((valor, indice) => {
    const h = (valor / 100) * (alto - 10)
    svg += `<rect x="${indice * paso + 5}" y="${alto - h}" width="${paso - 10}" height="${h}" rx="3" fill="${colorNivel(valor / 100)}"><title>${marcas[indice]}:00 · ${valor}%</title></rect><text x="${indice * paso + paso / 2}" y="${alto + 16}" text-anchor="middle" font-size="11" fill="var(--muted)">${marcas[indice]}h</text>`
  })
  return `${svg}</svg>`
}

// Número pseudoaleatorio fijo por zona, para que la vista simulada no cambie en cada render.
function semilla(texto: string): () => number {
  let h = 2166136261
  for (const letra of texto) h = Math.imul(h ^ letra.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

// Vista de cajones para los lotes sin chips: ocupación simulada con zona.occ de zona.cap.
// Estudiantes: casi todos de alumnos y unos accesibles. Personal: de maestros y unos accesibles.
export function svgLoteSimulado(zona: Zona): string {
  const ancho = 760
  const columnas = zona.cap > 100 ? 25 : zona.cap > 30 ? 20 : Math.min(zona.cap, 10)
  const filas = Math.ceil(zona.cap / columnas)
  const hueco = 4
  const wCajon = (ancho - 32 - hueco * (columnas - 1)) / columnas
  const hCajon = Math.min(wCajon * 1.6, 70)
  const carril = 28
  // Dos filas de cajones encaradas y un carril entre cada par.
  const yFila = (fila: number): number =>
    16 + fila * (hCajon + hueco) + Math.floor(fila / 2) * carril
  const alto = yFila(filas - 1) + hCajon + 16
  const azar = semilla(zona.id)
  const ocupados = new Set<number>()
  while (ocupados.size < Math.min(zona.occ, zona.cap)) ocupados.add(Math.floor(azar() * zona.cap))
  const accesibles = Math.max(1, Math.round(zona.cap * 0.04))
  const tipoBase: TipoCajon = zona.tipo === 'per' ? 'maestro' : 'alumno'

  let svg = `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${zona.name}, ${zona.cap} cajones, ${zona.occ} ocupados (simulado)"><rect width="${ancho}" height="${alto}" fill="var(--asphalt)"/>`
  for (let fila = 1; fila < filas; fila += 2) {
    if (fila + 1 >= filas) break
    const y = yFila(fila) + hCajon + carril / 2 + hueco / 2
    for (let x = 20; x < ancho; x += 60) {
      svg += `<rect x="${x}" y="${y - 2}" width="30" height="4" fill="var(--line)" opacity=".5"/>`
    }
  }
  for (let i = 0; i < zona.cap; i++) {
    const fila = Math.floor(i / columnas)
    const x = 16 + (i % columnas) * (wCajon + hueco)
    const y = yFila(fila)
    const tipo: TipoCajon = i < accesibles ? 'accesible' : tipoBase
    const ocupado = ocupados.has(i)
    const color = ocupado ? 'var(--busy)' : COLOR_TIPO[tipo]
    svg += `<rect x="${x}" y="${y}" width="${wCajon}" height="${hCajon}" rx="3" fill="${color}" opacity="${ocupado ? 0.55 : 0.3}" stroke="${color}" stroke-width="1.5"/>`
    if (ocupado) {
      svg += `<rect x="${x + wCajon * 0.18}" y="${y + hCajon * 0.15}" width="${wCajon * 0.64}" height="${hCajon * 0.7}" rx="${wCajon * 0.15}" fill="var(--line)" opacity=".55"/>`
    }
  }
  return `${svg}</svg>`
}
