import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { pool } from './config.js';
import router from './routes/usuarios.routes.js';
import routerFun from './routes/funciones.routes.js';
import routerC from "./routes/cines.routes.js"
import routerDs from './routes/dashboard.routes.js'
import routerD from './routes/dispositivos.routes.js';
import routerN from './routes/notificaciones.routes.js';
import routerP from './routes/peliculas.routes.js'
import routerR from './routes/reservas.routes.js';
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

app.use('/usuarios', router);
app.use('/cines', routerC);
app.use('/peliculas', routerP);
app.use('/funciones', routerFun);
app.use('/reservas', routerR);
app.use('/dispositivos', routerD);
app.use('/dashboard', routerDs);
app.use('/notificaciones', routerN);
app.get('/', (req, res) => res.json({ message: 'API Cine funcionando' }));
app.use(NoEncontrado);
app.use(manejarErrores);

export default app;