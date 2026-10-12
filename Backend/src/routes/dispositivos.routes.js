import { Router } from "express";
import { auth } from "../middlewares/aunth.js";
import { registrar, eliminar } from "../controllers/dispositivos.controllers.js";

const routerD = Router();

routerD.post('/', auth, registrar);
routerD.delete('/:token', auth, eliminar);

export default routerD;