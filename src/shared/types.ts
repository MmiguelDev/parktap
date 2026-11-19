export type EstadoCajon = 'ocupado' | 'libre'
export type Fuente = 'nfc' | 'simulacion'
export type TipoTap = 'entrada' | 'salida' | 'error'

export type Evento = {
  uid: string
  cajonId: string
  estado: EstadoCajon
  fuente: Fuente
  timestamp: number
}

export type Cajon = {
  id: string
  accesible: boolean
  estado: EstadoCajon
  ocupante: string | null
  desde: number | null
}

export type Usuario = {
  nombre: string
  placa: string
  permisoAccesible: boolean
}

export type Chip = {
  uid: string
  cajonId: string
  repuesto?: boolean
}

export type ResultadoTap = {
  ok: boolean
  mensaje: string
  tipo: TipoTap
  evento: Evento | null
  usuario: (Usuario & { id: string }) | null
  infraccion: boolean
  cajones: Cajon[]
}

export type RespuestaTap = {
  ok: boolean
  mensaje: string
  tipo: TipoTap
}

export type InfoServidor = {
  puerto: number
  https: boolean
  ips: string[]
}

export type TapEntrante = {
  requestId: string
  uidChip: string
  usuario: string
}

export type LineaRegistro = {
  timestamp: number
  placa: string
  cajonId: string
  tipo: 'entrada' | 'salida'
}
