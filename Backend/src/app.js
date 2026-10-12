import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { pool } from './config.js';
import usuariosRouter from './routes/usuarios.routes.js'
import { NoEncontrado, manejarErrores } from './middlewares/errores.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectada' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', db: 'sin conexión' });
  }
});

app.use('/Usaurios', usuariosRouter);
app.use(NoEncontrado);
app.use(manejarErrores);

export default app;