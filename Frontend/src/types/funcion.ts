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

export interface FuncionMapa {
  id: number;
  fecha_hora: string;
  estado: string;
  pelicula: string;
  precio: string;
  sala: string;
  filas: number;
  columnas: number;
}

export interface MapaAsientos {
  funcion: FuncionMapa;
  asientos: Asiento[];
}