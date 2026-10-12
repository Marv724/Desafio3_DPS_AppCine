export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
}

export type Rol = 'cliente' | 'personal';
