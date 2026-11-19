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

export type TipoCajon = 'alumno' | 'maestro' | 'accesible'
export type Rol = 'alumno' | 'maestro'

export type Cajon = {
  id: string
  tipo: TipoCajon
  accesible: boolean
  estado: EstadoCajon
  ocupante: string | null
  desde: number | null
  infraccion: boolean
  motivoInfraccion: string | null
}

export type Usuario = {
  nombre: string
  placa: string
  rol: Rol
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
  motivoInfraccion: string | null
  cajones: Cajon[]
}

export type RespuestaTap = {
  ok: boolean
  mensaje: string
  tipo: TipoTap
  // Motivo de la infracción cuando la entrada fue en un cajón sin permiso; el celular pita.
  alerta?: string | null
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
  rol: Rol
  cajonId: string
  tipo: 'entrada' | 'salida'
}

export type Alerta = {
  timestamp: number
  texto: string
}

export type Denegado = {
  timestamp: number
  placa: string
  rol: Rol | null
  zona: string
  motivo: string
}

// Lo que el panel le pasa al servidor para la app del usuario (dónde hay lugar).
export type EstadoParque = {
  cajones: { id: string; tipo: TipoCajon; estado: 'libre' | 'ocupado'; infraccion: boolean }[]
  zonas: {
    id: string
    name: string
    tipo: 'est' | 'per'
    cap: number
    occ: number
    demo: boolean
  }[]
}
