import { Router } from "express";
import bodyParser from "body-parser"
import { registrar, atualizar } from "../controllers/usuariosController.js";

const router = Router();

router.post("/registro", registrar);
router.put("/:id", atualizar);

export default router;
