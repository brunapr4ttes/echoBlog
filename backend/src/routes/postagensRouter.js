import { Router } from "express";
import bodyParser from "body-parser"
import { create, deletePostagem, getAll, getPostagem, updatePostagem, uploadImagePostagem } from "../controllers/postagensController.js";
import imageUpload from "../helpers/image-upload.js";

const router = Router();

router.post("/", imageUpload.single("imagem"), create);
router.get("/", getAll);
router.get("/:id", getPostagem);
router.put("/:id", updatePostagem);
router.delete("/:id", deletePostagem);
router.post("/:id/imagem", imageUpload.single("imagem"), uploadImagePostagem)

export default router;
