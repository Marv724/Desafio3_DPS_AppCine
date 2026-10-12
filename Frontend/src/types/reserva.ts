export interface Reserva {
  id: number;
  codigo: string;
  total: string;
  estado: 'activa' | 'utilizada' | 'cancelada';
  creada_en: string;
  funcion_id: number;
  fecha_hora: string;
  funcion_estado: string;
  pelicula: string;
  sala: string;
  cine: string;
  asientos: string[];
}