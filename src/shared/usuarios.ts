import type { Usuario } from './types'

// Demo con 4 cajones: 2 de alumnos, 1 de maestros y 1 accesible.
// - Ana y Bruno: alumnos (cajones A-03 y A-04).
// - Prof. Ramírez: maestro (cajón A-02).
// - Lucía: alumna con permiso de discapacidad (cajón accesible A-01).
// - Infractor: alumno sin permisos, para provocar las alertas en vivo.
export const usuarios: Record<string, Usuario> = {
  ana: { nombre: 'Ana Rodríguez', placa: 'FTR-482-A', rol: 'alumno', permisoAccesible: false },
  bruno: { nombre: 'Bruno Salas', placa: 'PRT-903-C', rol: 'alumno', permisoAccesible: false },
  profe: { nombre: 'Prof. Ramírez', placa: 'DOC-215-U', rol: 'maestro', permisoAccesible: false },
  lucia: { nombre: 'Lucía Blanco', placa: 'HJK-208-C', rol: 'alumno', permisoAccesible: true },
  infractor: { nombre: 'Infractor', placa: 'KLM-219-B', rol: 'alumno', permisoAccesible: false }
}

export function listaUsuarios(): (Usuario & { id: string })[] {
  return Object.entries(usuarios).map(([id, usuario]) => ({ id, ...usuario }))
}
