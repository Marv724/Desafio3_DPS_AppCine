import { pool } from '../config.js';

export const resumen = async (req, res, next) => {
  try {
    const [[ventas]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS reservas FROM reservas WHERE estado <> 'cancelada'"
    );
    const [porEstado] = await pool.query('SELECT estado, COUNT(*) AS cantidad FROM reservas GROUP BY estado');
    const [[boletos]] = await pool.query('SELECT COUNT(*) AS total FROM reserva_asientos');
    const [[clientes]] = await pool.query("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'cliente'");
    const [[proximas]] = await pool.query(
      "SELECT COUNT(*) AS total FROM funciones WHERE estado = 'programada' AND fecha_hora >= NOW()"
    );
    const [top] = await pool.query(
      `SELECT p.nombre, COUNT(ra.id) AS boletos
       FROM reserva_asientos ra
       JOIN funciones f ON f.id = ra.funcion_id
       JOIN peliculas p ON p.id = f.pelicula_id
       GROUP BY p.id, p.nombre
       ORDER BY boletos DESC LIMIT 5`
    );

    res.json({
      ventasTotales: Number(ventas.total),
      reservasTotales: ventas.reservas,
      boletosVendidos: boletos.total,
      clientes: clientes.total,
      funcionesProximas: proximas.total,
      reservasPorEstado: porEstado,
      peliculasTop: top,
    });
  } catch (e) {
    next(e);
  }
};