import { Router } from "express";
import { auth } from "../middlewares/aunth.js";
import { soloRol } from "../middlewares/rol.js";
import { resumen } from "../controllers/dashboard.controllers.js";

const routerDs = Router();

routerDs.get('/', auth, soloRol('personal'), resumen);

export default routerDs;