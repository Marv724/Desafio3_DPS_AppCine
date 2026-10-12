import { Router } from "express";
import { auth } from "../middlewares/aunth.js";
import { soloRol } from "../middlewares/rol.js";
import { listar, detalle, crear, editar, cambiarEstado, eliminar  } from "../controllers/peliculas.controllers.js";
import router from "./usuarios.routes.js";

const routerP = Router();
const personal = [auth, soloRol('personal')];

routerP.get('/', listar);
routerP.get('/:id', detalle);
routerP.post('/', ...personal, crear);
routerP.put('/:id', ...personal, editar);
routerP.patch('/:id/estado', ...personal, cambiarEstado);
routerP.delete('/:id', ...personal, eliminar);

export default routerP;