import {Router} from 'express';
import {auth} from '../middlewares/aunth.js';
import  {soloRol} from '../middlewares/rol.js';
import { crear, mias, validarBoleto } from '../controllers/reservas.controllers.js';

const  routerR = Router();

routerR.post('/', auth, soloRol('cliente'), crear);
routerR.get('/mias', auth, soloRol('cliente'), mias);
routerR.patch('/:codigo/validar', auth, soloRol('personal'), validarBoleto);

export default routerR;
