import type { Cajon, Evento } from './types'

export function procesarEvento(
  cajones: Cajon[],
  evento: Evento,
  ocupante: string | null,
  infraccion = false,
  motivoInfraccion: string | null = null
): Cajon[] {
  return cajones.map((cajon) => {
    if (cajon.id !== evento.cajonId) return cajon
    if (evento.estado === 'libre') {
      return {
        ...cajon,
        estado: 'libre',
        ocupante: null,
        desde: null,
        infraccion: false,
        motivoInfraccion: null
      }
    }
    return {
      ...cajon,
      estado: 'ocupado',
      ocupante,
      desde: evento.timestamp,
      infraccion,
      motivoInfraccion: infraccion ? motivoInfraccion : null
    }
  })
}
