import { pool } from "../config.js";

export const listar = async(req, res, next) => {
    try{
        const [cines] = await pool.query('SELECT * FROM cines ORDER BY nombre');
        res.json(cines);
    }
    catch (e) {
        next(e);
    }
};

export const listarSalas = async (req, res, next) => {
  try {
    const [salas] = await pool.query(
      `SELECT s.id, s.nombre, s.cine_id, c.nombre AS cine
       FROM salas s JOIN cines c ON c.id = s.cine_id
       ORDER BY c.nombre, s.nombre`
    );
    res.json(salas);
  } catch (e) {
    next(e);
  }
};