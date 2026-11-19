import { cajonDeUid } from './cajones'
import { procesarEvento } from './procesarEvento'
import type { Cajon, Evento, Fuente, ResultadoTap } from './types'
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
  const uidEvento = uid.trim().toUpperCase()
  const ocupadoPorPersona = cajones.find((cajon) => cajon.ocupante === usuarioId)
  if (ocupadoPorPersona) {
    const evento: Evento = {
      uid: uidEvento,
      cajonId: ocupadoPorPersona.id,
      estado: 'libre',
      fuente,
      timestamp: ahora
    }
    return {
      ok: true,
      mensaje: 'Salida registrada',
      tipo: 'salida',
      usuario: persona,
      infraccion: false,
      cajones: procesarEvento(cajones, evento, null),
      evento
    }
  }

  const destino = cajones.find((cajon) => cajon.id === cajonId)
  if (!destino) return error('Chip no registrado', cajones, persona)
  if (destino.estado === 'ocupado') return error('Cajón ocupado', cajones, persona)

  const infraccion = destino.accesible && !usuario.permisoAccesible
  const evento: Evento = {
    uid: uidEvento,
    cajonId: destino.id,
    estado: 'ocupado',
    fuente,
    timestamp: ahora
  }
  return {
    ok: true,
    mensaje: 'Entrada registrada',
    tipo: 'entrada',
    usuario: persona,
    infraccion,
    cajones: procesarEvento(cajones, evento, usuarioId),
    evento
  }
}
