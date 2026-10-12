import { z } from 'zod';
import { Expo } from 'expo-server-sdk';
import { pool } from '../config.js';
import { validar } from '../utils/validar.js';

export const registrar = async (req, res, next) => {
  try {
    const d = validar(z.object({ token: z.string().min(1) }), req.body, res);
    if (!d) return;
    if (!Expo.isExpoPushToken(d.token)) {
      return res.status(400).json({ message: 'Token de Expo inválido' });
    }
    await pool.query(
      `INSERT INTO dispositivos (usuario_id, expo_push_token) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id)`,
      [req.user.id, d.token]
    );
    res.status(201).json({ message: 'Dispositivo registrado' });
  } catch (e) {
    next(e);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const [r] = await pool.query(
      'DELETE FROM dispositivos WHERE expo_push_token = ? AND usuario_id = ?',
      [req.params.token, req.user.id]
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Dispositivo no encontrado' });
    res.json({ message: 'Dispositivo eliminado' });
  } catch (e) {
    next(e);
  }
};