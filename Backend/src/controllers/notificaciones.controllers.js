import { z } from 'zod';
import { validar } from '../utils/validar.js';
import { enviarPush, tokesDeCliente } from '../services/push.js';

export const aviso = async (req, res, next) => {
  try {
    const d = validar(
      z.object({ titulo: z.string().min(1).max(80), mensaje: z.string().min(1).max(250) }),
      req.body,
      res
    );
    if (!d) return;
    const tokens = await tokensDeClientes();
    const enviados = await enviarPush(tokens, d.titulo, d.mensaje, { tipo: 'aviso' });
    res.json({ enviados });
  } catch (e) {
    next(e);
  }
};