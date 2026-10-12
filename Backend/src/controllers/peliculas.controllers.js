import {z} from 'zod';
import { pool } from '../config.js';
import { validar } from '../utils/validar.js';

const ESTADOS = ['disponible', 'no_disponible'];

const peliculaSchema = z.object({
    codigo: z.string().min(1).max(20),
    nombre: z.string().min(1).max(150),
    genero: z.string().max(50).optional(),
    duracion: z.number().int().positive().optional(),
    clasificacion: z.string().max(10).optional(),
    precio: z.number().min(0),
    estado: z.enum(ESTADOS).optional()
});

export const listar = async (req, res, next) => {
    try{
        const {q, genero, clasificacion, estado} = req.query;
        const where = [];
        const params = [];
        if(q){
            where.push('(nombre LIKE ? OR codigo LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }
        if(genero){
            where.push('genero = ?'); params.push(genero);
        }
        if(clasificacion){
            where.push('clasificacion = ?'); params.push(estado);
        }
        if(estado){
            where.push('estado = ?'); params.push(genero);
        }

        const sql = `SELECT * FROM peliculas ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY nombre`
        const[filas] = await pool.query(sql, params);
        res.json(filas);
    }
    catch (e){
        next(e);
    }
}

export const detalle = async(req, res, next) => {
    try{
        const[d] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [req.params.id]);
        if(!d.length){
            return res.status(404).json({message: 'La pelicula no fue encontrada'});
        }
        res.json[d[0]];
    }
    catch (e) {
        next(e);
    }
};

export const crear = async (req, res, next) => {
    try{
        const c = validar(peliculaSchema, req.body, res);
        if(!c){
            return;
        }
        const [existe] = await pool.query('SELECT id FROM peliculas WHERE codigo = ?', [c.codigo]);
        if(existe.length){
            return res.status(409).json({message: 'El codigo ya existe'});
        }

        const [r] = await pool.query(
            `INSERT INTO peliculas (codigo, nombre, genero, duracion, clasificacion, precio, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [d.codigo, d.nombre, d.genero ?? null, d.duracion ?? null, d.clasificacion ?? null, d.precio, d.estado ?? 'disponible']
        );
        const [f] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [r.insertId]);
        res.status(201).json(f[0]);
    }
    catch (e) {
        next(e);
    }
};

export const editar = async (req, res, next) => {
    try{
        const e = validar(peliculaSchema, req.body, res);
        if(!e){
            return;
        }
        const id = Number(req.params.id);
        const [f] = await pool.query('SELECT id FROM peliculas WHERE id = ?', [id]);
        if(!f.length){
            return res.status(404).json({message: 'La pelicula no fue encontrada'});
        }

        await pool.query(
            `UPDATE peliculas SET codigo=?, nombre=?, genero=?, duracion=?, clasificacion=?, precio=?, estado=?
            WHERE id=?`,
            [e.codigo, e.nombre, e.genero ?? null, e.duracion ?? null, e.clasificacion ?? null, e.precio, e.estado ?? 'disponible', id ]
        );
        const [r] = await pool.query('SELECT * FROM peliculas WHERE id = ?', [id]);
        res.json(r[0]);
    }
    catch (m) {
        if(m.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({message: ' El codigo ingresado ya existe'});
        }
        next(m);
    }
};

export const cambiarEstado = async (req, res, next) => {
    try{
        const d = validar(z.object({estado: z.number(ESTADOS)}), req.body, res);
        if(!d){
            return;
        }
        const [f] = await pool.query('SELECT id FROM peliculas WHERE id = ?', [req.params.id]);
        if(!f.length){
            return res.status(404).json({message: 'Pelicula no fue encontrada'});
        }
        await pool.query('UPDATE peliculas SET estado = ? WHERE id = ?', [d.estado, req.params.id]);
        res.json({id: Number(req.params.id), estado: d.estado});
    }
    catch (e){
        next(e);
    }
};

export const eliminar = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const id = Number(req.params.id);
    const [f] = await conn.query('SELECT id FROM peliculas WHERE id = ?', [id]);
    if (!f.length) return res.status(404).json({ message: 'Película no encontrada' });

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM reservas r
       JOIN funciones f ON f.id = r.funcion_id
       WHERE f.pelicula_id = ? AND r.estado = 'activa'`,
      [id]
    );
    if (total > 0) {
      return res.status(409).json({ message: 'La película tiene reservas activas' });
    }

    await conn.beginTransaction();
    await conn.query('DELETE FROM reservas WHERE funcion_id IN (SELECT id FROM funciones WHERE pelicula_id = ?)', [id]);
    await conn.query('DELETE FROM funciones WHERE pelicula_id = ?', [id]);
    await conn.query('DELETE FROM peliculas WHERE id = ?', [id]);
    await conn.commit();
    res.json({ message: 'Película eliminada' });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};