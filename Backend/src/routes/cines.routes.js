import { Router } from "express";
import { listar, listarSalas } from "../controllers/cines.controllers.js";

const routerC = Router();
routerC.get('/', listar);
routerC.get('/', listarSalas)
export default routerC;