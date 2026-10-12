import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import { pool } from '../config.js';

const reguistroSchema = z.object({
    nombre: z.string().min(2),
    correo: z.string().email(),
    clave: z.string().min(6)
});

const loginShema = z.object({
    correo: z.string().email(),
    clave: z.string().min(1)
})

const firma = (f) => jwt.sign({id: f.id, rol: f.rol}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

export const registro = async(req, res, next) => {
    try{
        const datos = reguistroSchema.safeParse(req.body);
        if(!datos.success){
            return res.status(400).json({message: 'Datos invalidos revisar nuevamente'})
        }
        const {nombre, correo, clave} = datos.data;
        const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
        if(existe.length){
            return res.status(409).json({message: 'Correo ya reguistado'})
        }
        const hash = await bcrypt.hash(clave, 10);
        const [r] = await pool.query(
            'INSERT INTO usuarios (nombre, correo, clave, rol) VALUES (?, ?, ?, "cliente")', [nombre, correo, hash]
        );
        const usuario = {id: r.insertId, nombre, correo, rol: 'cliente'};
        res.status(201).json({usuario, token: firma(usuario)});
    }
    catch (e) {
        next(e)
    }
};

export const login = async(req, res, next) => {
    try{
        const datos =loginShema.safeParse(req.body);
        if(!datos.success) {
            return res.status(400).json({message: 'Correo y contraseña son obligatorios'})
        }
        const {correo, clave} = datos.data;
        const[filas] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        const l = filas[0];
        if(!l || !(await bcrypt.compare(clave, l.clave))){
            return res.status(401).json({message: 'Usuario o contraseña son incorrectos'});
        }
          const usuario = {id: l.id, nombre: l.nombre, correo: l.correo, rol: l.rol};
          res.json({usuario, token: firma(usuario)});
    }
    catch(e){
        next(e)
    }
}