import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Conexão
import conn from "./config/conn.js";

// Rotas
import postagensRouter from "./routes/postagensRouter.js";
import usuariosRouter from "./routes/usuariosRouter.js";

// Importação dos models
import "./models/postagensModel.js";
import "./models/usuariosModel.js";

const PORT = process.env.PORT || 3333;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middlewares para upload de imagens
app.use("/public", express.static(path.join(__dirname, "public")));

// Conexão com o banco
conn
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log("🛵 Servidor rodando na port:", PORT);
    });
  })
  .catch((err) => console.error(err));

// Utilizando Rotas
app.use("/postagens", postagensRouter);
app.use("/usuarios", usuariosRouter);

app.use((request, response) => {
  response.status(404).json({ msg: "Rota não encontrada" });
});
