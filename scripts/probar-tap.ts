import { cajonesIniciales, uidDeCajon, uidParaSimulacion } from '../src/shared/cajones'
import { procesarTap } from '../src/shared/procesarTap'

function assert(condicion: unknown, mensaje: string): void {
  if (!condicion) throw new Error(mensaje)
}

const uid = (cajonId: string): string => {
  const valor = uidDeCajon(cajonId)
  if (!valor) throw new Error(`Sin UID para ${cajonId}`)
  return valor
}

// Lote: A-01 accesible, A-02 maestros, A-03 y A-04 alumnos.
let cajones = cajonesIniciales()
assert(cajones.length === 4, 'el lote tiene 4 cajones')

let r = procesarTap(uid('A-03').toLowerCase(), 'ana', 'nfc', cajones)
assert(r.ok && r.tipo === 'entrada' && !r.infraccion, 'ana entra a A-03 sin infracción')
cajones = r.cajones

r = procesarTap(uid('A-03'), 'ana', 'nfc', cajones)
assert(r.tipo === 'salida', 'segundo tap de ana es salida')
cajones = r.cajones
assert(cajones.find((c) => c.id === 'A-03')?.estado === 'libre', 'A-03 queda libre')

r = procesarTap(uid('A-02'), 'profe', 'nfc', cajones)
assert(r.tipo === 'entrada' && !r.infraccion, 'el maestro puede usar A-02')
assert(r.usuario?.rol === 'maestro', 'profe tiene rol maestro')
cajones = r.cajones
r = procesarTap(uid('A-02'), 'profe', 'nfc', cajones)
cajones = r.cajones

r = procesarTap(uid('A-02'), 'bruno', 'nfc', cajones)
assert(
  r.infraccion && r.motivoInfraccion === 'Alumno en cajón de maestros',
  'alumno en A-02 es infracción'
)
cajones = r.cajones

r = procesarTap(uid('A-01'), 'infractor', 'nfc', cajones)
assert(r.infraccion && r.motivoInfraccion === 'Cajón accesible sin permiso', 'infractor en A-01')
cajones = r.cajones

r = procesarTap(uid('A-01'), 'lucia', 'nfc', cajones)
assert(r.mensaje === 'Cajón ocupado', 'no puede ocupar un cajón ajeno')

r = procesarTap(uid('A-01'), 'lucia', 'nfc', cajonesIniciales())
assert(r.tipo === 'entrada' && !r.infraccion, 'lucía tiene permiso accesible')

r = procesarTap('FF:FF:FF:FF', 'ana', 'nfc', cajonesIniciales())
assert(!r.ok && r.mensaje === 'Chip no registrado', 'UID desconocido')

r = procesarTap(uidParaSimulacion('A-04'), 'bruno', 'simulacion', cajonesIniciales())
assert(r.tipo === 'entrada' && r.evento?.cajonId === 'A-04', 'el clic simula A-04')

console.log('procesarTap ok')
