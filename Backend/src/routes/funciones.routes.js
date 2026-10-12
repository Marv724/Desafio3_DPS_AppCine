import { Router } from "express";
import { auth } from "../middlewares/aunth.js";
import { soloRol } from "../middlewares/rol.js";
import { listar, crear, reprogramar, cancelar, asientos } from "../controllers/cines.controllers.js";
import router from "./usuarios.routes.js";

const routerFun = Router();
const personal = [auth, soloRol('personal')];

routerFun.get('/', listar);
routerFun.get('/:id/asientos', asientos);
routerFun.post('/', ...personal, crear);
routerFun.put('/:id', ...personal, reprogramar);
routerFun.patch('/:id/cancelar', ...personal, cancelar);

export default routerFun;