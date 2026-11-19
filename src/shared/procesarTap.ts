import { cajonDeUid } from './cajones'
import type { Cajon, Fuente, ResultadoTap } from './types'
import { usuarios } from './usuarios'

function error(
  mensaje: string,
  cajones: Cajon[],
  usuario: ResultadoTap['usuario'] = null
): ResultadoTap {
  return {
    ok: false,
    mensaje,
    tipo: 'error',
    evento: null,
    usuario,
    infraccion: false,
    cajones
  }
}

export function procesarTap(
  uid: string,
  usuarioId: string,
  fuente: Fuente,
  cajones: Cajon[]
): ResultadoTap {
  const usuario = usuarios[usuarioId]
  if (!usuario) return error('Usuario no registrado', cajones)

  const persona = { id: usuarioId, ...usuario }
  const cajonId = cajonDeUid(uid)
  if (!cajonId) return error('Chip no registrado', cajones, persona)

  const ahora = Date.now()
  const ocupadoPorPersona = cajones.find((cajon) => cajon.ocupante === usuarioId)
  if (ocupadoPorPersona) {
    const siguientes = cajones.map((cajon) =>
      cajon.id === ocupadoPorPersona.id
        ? { ...cajon, estado: 'libre' as const, ocupante: null, desde: null }
        : cajon
    )
    return {
      ok: true,
      mensaje: 'Salida registrada',
      tipo: 'salida',
      usuario: persona,
      infraccion: false,
      cajones: siguientes,
      evento: {
        uid: uid.trim().toUpperCase(),
        cajonId: ocupadoPorPersona.id,
        estado: 'libre',
        fuente,
        timestamp: ahora
      }
    }
  }

  const destino = cajones.find((cajon) => cajon.id === cajonId)
  if (!destino) return error('Chip no registrado', cajones, persona)
  if (destino.estado === 'ocupado') return error('Cajón ocupado', cajones, persona)

  const infraccion = destino.accesible && !usuario.permisoAccesible
  const siguientes = cajones.map((cajon) =>
    cajon.id === destino.id
      ? { ...cajon, estado: 'ocupado' as const, ocupante: usuarioId, desde: ahora }
      : cajon
  )
  return {
    ok: true,
    mensaje: 'Entrada registrada',
    tipo: 'entrada',
    usuario: persona,
    infraccion,
    cajones: siguientes,
    evento: {
      uid: uid.trim().toUpperCase(),
      cajonId: destino.id,
      estado: 'ocupado',
      fuente,
      timestamp: ahora
    }
  }
}
