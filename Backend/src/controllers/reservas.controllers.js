import crypto from 'node:crypto';
import { z } from 'zod';
import { pool } from '../config.js';
import { validar } from '../utils/validar.js';
import { enviarPush, tokensDeUsuarios } from '../services/push.js';

const reservaSchema = z.object({
  funcionId: z.number().int().positive(),
  asientos: z.array(z.string().regex(/^[A-Z]\d{1,2}$/, 'asiento inválido')).min(1).max(10),
});

export const crear = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const d = validar(reservaSchema, req.body, res);
    if (!d) return;
    const asientos = [...new Set(d.asientos)];

    const [f] = await conn.query(
      `SELECT f.id, f.estado, p.nombre AS pelicula, p.precio, s.filas, s.columnas
       FROM funciones f
       JOIN peliculas p ON p.id = f.pelicula_id
       JOIN salas s ON s.id = f.sala_id
       WHERE f.id = ?`,
      [d.funcionId]
    );
    if (!f.length) return res.status(404).json({ message: 'Función no encontrada' });
    const fn = f[0];
    if (fn.estado !== 'programada') {
      return res.status(400).json({ message: 'La función no está disponible' });
    }

    for (const a of asientos) {
      const fila = a.charCodeAt(0) - 65;
      const col = Number(a.slice(1));
      if (fila >= fn.filas || col < 1 || col > fn.columnas) {
        return res.status(400).json({ message: `El asiento ${a} no existe en la sala` });
      }
    }

    const codigo = 'RES-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const total = Number(fn.precio) * asientos.length;

    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO reservas (codigo, usuario_id, funcion_id, total) VALUES (?, ?, ?, ?)',
      [codigo, req.user.id, d.funcionId, total]
    );
    await conn.query(
      'INSERT INTO reserva_asientos (reserva_id, funcion_id, asiento) VALUES ?',
      [asientos.map((a) => [r.insertId, d.funcionId, a])]
    );
    await conn.commit();

    tokensDeUsuarios([req.user.id])
      .then((t) => enviarPush(t, 'Reserva confirmada', `${fn.pelicula}: asientos ${asientos.join(', ')}`, { tipo: 'reserva', codigo }))
      .catch(() => {});

    res.status(201).json({
      id: r.insertId, codigo, funcionId: d.funcionId, total, estado: 'activa', asientos,
    });
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Algún asiento ya está ocupado' });
    }
    next(e);
  } finally {
    conn.release();
  }
};

export const mias = async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      `SELECT r.id, r.codigo, r.total, r.estado, r.creada_en,
              f.id AS funcion_id, f.fecha_hora, f.estado AS funcion_estado,
              p.nombre AS pelicula, s.nombre AS sala, c.nombre AS cine,
              GROUP_CONCAT(ra.asiento ORDER BY ra.asiento) AS asientos
       FROM reservas r
       JOIN funciones f ON f.id = r.funcion_id
       JOIN peliculas p ON p.id = f.pelicula_id
       JOIN salas s ON s.id = f.sala_id
       JOIN cines c ON c.id = s.cine_id
       LEFT JOIN reserva_asientos ra ON ra.reserva_id = r.id
       WHERE r.usuario_id = ?
       GROUP BY r.id, f.id, p.id, s.id, c.id
       ORDER BY r.creada_en DESC`,
      [req.user.id]
    );
    res.json(filas.map((x) => ({ ...x, asientos: x.asientos ? x.asientos.split(',') : [] })));
  } catch (e) {
    next(e);
  }
};

export const validarBoleto = async (req, res, next) => {
  try {
    const [f] = await pool.query('SELECT id, codigo, estado FROM reservas WHERE codigo = ?', [req.params.codigo]);
    if (!f.length) return res.status(404).json({ message: 'Reserva no encontrada' });
    if (f[0].estado !== 'activa') {
      return res.status(409).json({ message: `El boleto ya está ${f[0].estado}` });
    }
    await pool.query("UPDATE reservas SET estado = 'utilizada' WHERE id = ?", [f[0].id]);
    res.json({ codigo: f[0].codigo, estado: 'utilizada' });
  } catch (e) {
    next(e);
  }
};