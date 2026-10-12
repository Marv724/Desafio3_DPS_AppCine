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