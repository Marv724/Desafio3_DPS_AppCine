import { Router } from "express";
import { listar } from "../controllers/cines.controllers.js";

const routerC = Router();
routerC.get('/', listar);

export default routerC;