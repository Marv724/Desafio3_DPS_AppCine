import { z } from 'zod';
import { pool } from '../config.js';
import { validar, normalizarFecha, FECHA_REGEX } from '../utils/validar.js';
import { enviarPush, tokensDeUsuarios } from '../services/push.js';

const BASE = `
  SELECT f.id, f.fecha_hora, f.estado,
         p.id AS pelicula_id, p.nombre AS pelicula, p.precio,
         s.id AS sala_id, s.nombre AS sala,
         c.id AS cine_id, c.nombre AS cine
  FROM funciones f
  JOIN peliculas p ON p.id = f.pelicula_id
  JOIN salas s ON s.id = f.sala_id
  JOIN cines c ON c.id = s.cine_id`;

const crearSchema = z.object({
  peliculaId: z.number().int().positive(),
  salaId: z.number().int().positive(),
  fechaHora: z.string().regex(FECHA_REGEX, 'formato AAAA-MM-DD HH:mm'),
});
const editarSchema = z.object({
  fechaHora: z.string().regex(FECHA_REGEX, 'formato AAAA-MM-DD HH:mm'),
});

export const listar = async (req, res, next) => {
  try {
    const { peliculaId, cineId } = req.query;
    const where = [];
    const params = [];
    if (peliculaId) { where.push('f.pelicula_id = ?'); params.push(peliculaId); }
    if (cineId) { where.push('c.id = ?'); params.push(cineId); }
    const sql = `${BASE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY f.fecha_hora`;
    const [filas] = await pool.query(sql, params);
    res.json(filas);
  } catch (e) {
    next(e);
  }
};

export const crear = async (req, res, next) => {
  try {
    const d = validar(crearSchema, req.body, res);
    if (!d) return;
    const [p] = await pool.query('SELECT id FROM peliculas WHERE id = ?', [d.peliculaId]);
    if (!p.length) return res.status(404).json({ message: 'Película no encontrada' });
    const [s] = await pool.query('SELECT id FROM salas WHERE id = ?', [d.salaId]);
    if (!s.length) return res.status(404).json({ message: 'Sala no encontrada' });

    const [r] = await pool.query(
      'INSERT INTO funciones (pelicula_id, sala_id, fecha_hora) VALUES (?, ?, ?)',
      [d.peliculaId, d.salaId, normalizarFecha(d.fechaHora)]
    );
    const [f] = await pool.query(`${BASE} WHERE f.id = ?`, [r.insertId]);
    res.status(201).json(f[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'La sala ya tiene una función en ese horario' });
    }
    next(e);
  }
};

export const reprogramar = async (req, res, next) => {
  try {
    const d = validar(editarSchema, req.body, res);
    if (!d) return;
    const id = Number(req.params.id);
    const [f] = await pool.query(`${BASE} WHERE f.id = ?`, [id]);
    if (!f.length) return res.status(404).json({ message: 'Función no encontrada' });
    if (f[0].estado !== 'programada') {
      return res.status(409).json({ message: 'Solo se puede reprogramar una función programada' });
    }

    const nueva = normalizarFecha(d.fechaHora);
    await pool.query('UPDATE funciones SET fecha_hora = ? WHERE id = ?', [nueva, id]);

    const [us] = await pool.query(
      "SELECT DISTINCT usuario_id FROM reservas WHERE funcion_id = ? AND estado = 'activa'",
      [id]
    );
    const tokens = await tokensDeUsuarios(us.map((u) => u.usuario_id));
    await enviarPush(tokens, 'Función reprogramada', `${f[0].pelicula} ahora es el ${nueva}`, {
      tipo: 'reprogramada',
      funcionId: id,
    });

    const [r] = await pool.query(`${BASE} WHERE f.id = ?`, [id]);
    res.json(r[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'La sala ya tiene una función en ese horario' });
    }
    next(e);
  }
};

export const cancelar = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const id = Number(req.params.id);
    const [f] = await conn.query(`${BASE} WHERE f.id = ?`, [id]);
    if (!f.length) return res.status(404).json({ message: 'Función no encontrada' });
    if (f[0].estado === 'cancelada') {
      return res.status(409).json({ message: 'La función ya está cancelada' });
    }

    const [us] = await conn.query(
      "SELECT DISTINCT usuario_id FROM reservas WHERE funcion_id = ? AND estado = 'activa'",
      [id]
    );

    await conn.beginTransaction();
    await conn.query("UPDATE funciones SET estado = 'cancelada' WHERE id = ?", [id]);
    await conn.query(
      "DELETE FROM reserva_asientos WHERE reserva_id IN (SELECT id FROM reservas WHERE funcion_id = ? AND estado = 'activa')",
      [id]
    );
    await conn.query("UPDATE reservas SET estado = 'cancelada' WHERE funcion_id = ? AND estado = 'activa'", [id]);
    await conn.commit();

    const tokens = await tokensDeUsuarios(us.map((u) => u.usuario_id));
    await enviarPush(tokens, 'Función cancelada', `Se canceló la función de ${f[0].pelicula}`, {
      tipo: 'cancelada',
      funcionId: id,
    });

    res.json({ message: 'Función cancelada', clientesAvisados: us.length });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

export const asientos = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [f] = await pool.query(
      `SELECT f.id, f.fecha_hora, f.estado, p.nombre AS pelicula, p.precio,
              s.nombre AS sala, s.filas, s.columnas
       FROM funciones f
       JOIN peliculas p ON p.id = f.pelicula_id
       JOIN salas s ON s.id = f.sala_id
       WHERE f.id = ?`,
      [id]
    );
    if (!f.length) return res.status(404).json({ message: 'Función no encontrada' });

    const [ocup] = await pool.query('SELECT asiento FROM reserva_asientos WHERE funcion_id = ?', [id]);
    const ocupados = new Set(ocup.map((o) => o.asiento));

    const lista = [];
    for (let i = 0; i < f[0].filas; i++) {
      const fila = String.fromCharCode(65 + i); // A, B, C...
      for (let c = 1; c <= f[0].columnas; c++) {
        const codigo = `${fila}${c}`;
        lista.push({ codigo, fila, columna: c, estado: ocupados.has(codigo) ? 'ocupado' : 'libre' });
      }
    }
    res.json({ funcion: f[0], asientos: lista });
  } catch (e) {
    next(e);
  }
};