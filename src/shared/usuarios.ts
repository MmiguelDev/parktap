import type { Usuario } from './types'

// 5 estudiantes, 1 con permiso de cajón accesible y 1 infractor.
export const usuarios: Record<string, Usuario> = {
  ana: { nombre: 'Ana Rodríguez', placa: 'FTR-482-A', permisoAccesible: false },
  bruno: { nombre: 'Bruno Salas', placa: 'PRT-903-C', permisoAccesible: false },
  carla: { nombre: 'Carla Méndez', placa: 'DSA-118-A', permisoAccesible: false },
  diego: { nombre: 'Diego Navarro', placa: 'MNB-774-C', permisoAccesible: false },
  elena: { nombre: 'Elena Paz', placa: 'QWE-650-B', permisoAccesible: false },
  lucia: { nombre: 'Lucía Blanco', placa: 'HJK-208-C', permisoAccesible: true },
  infractor: { nombre: 'Infractor', placa: 'KLM-219-B', permisoAccesible: false }
}

export function listaUsuarios(): (Usuario & { id: string })[] {
  return Object.entries(usuarios).map(([id, usuario]) => ({ id, ...usuario }))
}
