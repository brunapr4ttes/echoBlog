import { Router } from "express";
import bodyParser from "body-parser"
import { registrar, atualizar, getUsuarios } from "../controllers/usuariosController.js";

const router = Router();

router.post("/registro", registrar);
router.put("/:id", atualizar);
router.get("/", getUsuarios);

export default router;
