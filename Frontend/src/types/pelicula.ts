export interface Pelicula {
  id: number;
  codigo: string;
  nombre: string;
  genero: string | null;
  duracion: number | null;
  clasificacion: string | null;
  precio: string;
  estado: EstadoPelicula;
};

export type EstadoPelicula = 'disponible' | 'no_disponible';
