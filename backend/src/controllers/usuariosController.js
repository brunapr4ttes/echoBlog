import { z } from "zod";
import formatZodError from "../helpers/zodError.js";
import Usuario from "../models/usuariosModel.js";

const registrarSchema = z.object({
  nome: z
    .string()
    .min(3, { msg: "O nome deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  email: z.string().regex(new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g), {
    msg: "Email não está no formato",
  }),
  senha: z
    .string()
    .min(8, { msg: "O autor deve ter pelo menos 8 caracteres" })
    .regex(new RegExp(/([0-9a-zA-Z])$/)),
  papel: z.enum(["leitor", "autor", "administrador"]).optional(),
});

export const registrar = async (request, response) => {
  const bodyValidation = registrarSchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(400).json({
      msg: "Os dados recebidos do corpo são invalidos",
      detalhes: formatZodError(bodyValidation.error),
    });
    return;
  }

  const { nome, email, senha, papel } = request.body;

  if (!nome) {
    response.status(400).json({ err: "O nome é obirgatoria" });
    return;
  }
  if (!email) {
    response.status(400).json({ err: "O email é obirgatoria" });
    return;
  }
  if (!senha) {
    response.status(400).json({ err: "A senha é obirgatoria" });
    return;
  }

  const emailExiste = await Usuario.findAll({ where: { email: email } });

  if (emailExiste.length > 0) {
    response.status(409).json({ err: "já existe um usuario com este email" });
    return;
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    papel: papel || "leitor",
  };

  try {
    await Usuario.create(novoUsuario);
    response.status(201).json({ msg: "usuario Cadastrado" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ err: "Erro ao cadastrar usuario" });
  }
};
