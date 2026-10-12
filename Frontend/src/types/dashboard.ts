export interface Dashboard {
  ventasTotales: number;
  reservasTotales: number;
  boletosVendidos: number;
  clientes: number;
  funcionesProximas: number;
  reservasPorEstado: { estado: string; cantidad: number }[];
  peliculasTop: { nombre: string; boletos: number }[];
}