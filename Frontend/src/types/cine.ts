export interface Cine {
  id: number;
  nombre: string;
  direccion: string;
  latitud: string; 
  longitud: string;
}

export interface Sala {
  id: number;
  nombre: string;
  cine_id: number;
  cine: string;
}