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
    return response.status(400).json({
      msg: "Os dados recebidos do corpo são inválidos",
      detalhes: formatZodError(bodyValidation.error),
    });
  }

  const { nome, email, senha, papel } = bodyValidation.data;

  try {
    const emailExiste = await Usuario.findOne({ where: { email } });

    if (emailExiste) {
      return response.status(409).json({ err: "Já existe um usuário com este email" });
    }

    const novoUsuario = {
      nome,
      email,
      senha, 
      papel,
    };

    await Usuario.create(novoUsuario);
    return response.status(201).json({ msg: "Usuário cadastrado com sucesso" });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ err: "Erro ao cadastrar usuário" });
  }
};

export const getUsuarios =  async (request, response) =>{
  const {nome, email, papel} = request.body;

  if (response.user.paper !== 'administrador') { //tem q usar token aqui mds como q faz isso
    return response.status(403).json({ err: "Acesso negado. Apenas administradores podem acessar esta rota." });
  }

  try {
    const where = {};

    if (nome) {
      where.nome = { [Op.iLike]: `%${nome}%` }; //o op.ilike é uma função do sequelize que não diferencia maiusculas de minusculas
    }
    if (email) {
      where.email = { [Op.iLike]: `%${email}%` }; 
    }
    if (papel) {
      where.papel = papel; 
    }

    const usuarios = await Usuario.findAll({ where });

    return response.status(200).json(usuarios);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ err: "Erro ao listar usuários" });
  }
};


export const atualizar = async (request, response) => {
  const paramValidator = getSchema.safeParse(request.params);
  if(!paramValidator.success){
      response.status(400).json({
          message: "Número de identificação está inválido",
          detalhes: formatZodError(paramValidator.error),
      })
      return
  }

  const updateValidator = updateUsuarioSchema.safeParse(request.body)

  const {id} = request.params
  const {nome, email, senha, papel} = request.body

  const usuarioAtualizado = {
      nome, 
      email, 
      senha, 
      papel
  }

  try {
      await Usuario.update(usuarioAtualizado, {where: {id}});
      response.status(200).json({message: "Usuário atualizado"});
  } catch (error) {
      response.status(500).json({message: "Erro ao atualizar usuário"});
  }
}
