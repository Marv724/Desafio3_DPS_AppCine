export interface Funcion {
  id: number;
  fecha_hora: string;
  estado: 'programada' | 'cancelada' | 'finalizada';
  pelicula_id: number;
  pelicula: string;
  precio: string;
  sala_id: number;
  sala: string;
  cine_id: number;
  cine: string;
}

export interface Asiento {
  codigo: string;
  fila: string;
  columna: number;
  estado: 'libre' | 'ocupado';
}