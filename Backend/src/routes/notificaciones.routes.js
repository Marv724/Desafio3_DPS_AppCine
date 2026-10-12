import { Router } from "express";
import { auth } from "../middlewares/aunth.js";
import { soloRol } from "../middlewares/rol.js";
import { aviso } from "../controllers/notificaciones.controllers.js";

const routerN = Router();
routerN.post('/aviso', auth, soloRol('personal'), aviso);

export default routerN;