import { Router } from "express";
import { reguistro, login } from "../controllers/usuarios.controllers";

const router = Router();
router.post('/reguisto', reguistro);
router.post('/login', login);

export default router;