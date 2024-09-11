import { Router } from "express";
import bodyParser from "body-parser"
import { registrar } from "../controllers/usuariosController.js";

const router = Router();

router.post("/registro", registrar);

export default router;
