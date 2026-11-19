import { cajonesIniciales, uidDeCajon } from '../src/shared/cajones'
import { procesarTap } from '../src/shared/procesarTap'

function assert(condicion: unknown, mensaje: string): void {
  if (!condicion) throw new Error(mensaje)
}

const uid = (cajonId: string): string => {
  const valor = uidDeCajon(cajonId)
  if (!valor) throw new Error(`Sin UID para ${cajonId}`)
  return valor
}

let cajones = cajonesIniciales()

let resultado = procesarTap(uid('A-03').toLowerCase(), 'ana', 'simulacion', cajones)
assert(resultado.ok && resultado.tipo === 'entrada', 'ana debe entrar')
assert(resultado.evento?.cajonId === 'A-03', 'la entrada es en A-03')
assert(resultado.evento?.estado === 'ocupado', 'el evento queda ocupado')
cajones = resultado.cajones

resultado = procesarTap(uid('B-01'), 'ana', 'nfc', cajones)
assert(resultado.tipo === 'salida', 'un segundo tap de ana es salida')
assert(resultado.evento?.cajonId === 'A-03', 'sale del cajón donde estaba')
assert(resultado.evento?.fuente === 'nfc', 'conserva la fuente')
cajones = resultado.cajones
assert(cajones.find((cajon) => cajon.id === 'A-03')?.estado === 'libre', 'A-03 queda libre')

resultado = procesarTap('FF:FF:FF:FF', 'ana', 'simulacion', cajones)
assert(!resultado.ok && resultado.mensaje === 'Chip no registrado', 'UID desconocido')

resultado = procesarTap(uid('A-03'), 'nadie', 'simulacion', cajones)
assert(resultado.mensaje === 'Usuario no registrado', 'usuario desconocido')

resultado = procesarTap(uid('A-01'), 'infractor', 'nfc', cajones)
assert(resultado.tipo === 'entrada' && resultado.infraccion, 'infractor en A-01 es infracción')
cajones = resultado.cajones

resultado = procesarTap(uid('A-01'), 'lucia', 'simulacion', cajones)
assert(resultado.mensaje === 'Cajón ocupado', 'no ocupa un cajón ajeno')

cajones = cajonesIniciales()
resultado = procesarTap(uid('A-02'), 'lucia', 'simulacion', cajones)
assert(resultado.tipo === 'entrada' && !resultado.infraccion, 'lucía sí tiene permiso')

console.log('procesarTap ok')
