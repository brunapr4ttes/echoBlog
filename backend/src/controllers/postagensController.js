import { z } from "zod";
import formatZodError from "../helpers/zodError.js";
import fs from "fs";
import Postagem from "../models/postagensModel.js";

// Validações com ZOD
const createSchema = z.object({
  titulo: z
    .string()
    .min(3, { msg: "O titulo deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  conteudo: z
    .string()
    .min(5, { msg: "O conteudo deve ter pelo menos 5 caracteres" }),
  autor: z.string().min(3, { msg: "O autor deve ter pelo menos 3 caracteres" }),
});

const updatePostagemSchema = z.object({
  titulo: z
    .string()
    .min(3, { msg: "O titulo deve ter pelo menos 3 caracteres" })
    .transform((txt) => txt.toLowerCase()),
  conteudo: z
    .string()
    .min(5, { msg: "O conteudo deve ter pelo menos 5 caracteres" }),
  autor: z.string().min(3, { msg: "O autor deve ter pelo menos 3 caracteres" }),
  imagem: z.string().optional(),
});

export const create = async (request, response) => {
  const bodyValidation = createSchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(400).json({
      msg: "Os dados recebidos do corpo são invalidos",
      detalhes: formatZodError(bodyValidation.error),
    });
    return;
  }

  const { titulo, conteudo, autor } = request.body;

  let imagem;
  if (request.file) {
    imagem = request.file.filename;
  } else {
    imagem = "postagemDefault.png";
  }

  if (!titulo) {
    response.status(400).json({ err: "O titulo é obirgatoria" });
    return;
  }
  if (!conteudo) {
    response.status(400).json({ err: "O conteudo é obirgatoria" });
    return;
  }
  if (!autor) {
    response.status(400).json({ err: "O autor é obirgatoria" });
    return;
  }

  const novaPostagem = {
    titulo,
    conteudo,
    autor,
    imagem,
  };

  try {
    await Postagem.create(novaPostagem);
    response.status(201).json({ msg: "Postagem Cadastrada" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ err: "Erro ao cadastrar postagem" });
  }
};

export const getAll = async (request, response) => {
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const offset = (page - 1) * 10;
  try {
    const postagens = await Postagem.findAndCountAll({
      limit,
      offset,
    });
    const totalPaginas = Math.ceil(postagens.count / limit);
    response.status(200).json({
      totalPostagens: postagens.count,
      totalPaginas,
      paginaAtual: page,
      itemsPorPagina: limit,
      proximaPagina:
        totalPaginas === 0
          ? null
          : `http://localhost:3333/postagens?page=${page + 1}`,
      postagens: postagens.rows,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Erro ao buscar postagens" });
  }
};

export const getPostagem = async (request, response) => {
  const { id } = request.params;

  try {
    const postagem = await Postagem.findByPk(id);
    if (postagem === null) {
      response.status(404).json({ msg: "Postagem não encontrada" });
      return;
    }
    response.status(200).json(postagem);
  } catch (error) {
    response.status(500).json({ err: "Erro ao buscar postagens" });
  }
};

export const updatePostagem = async (request, response) => {
  const paramValidation = updatePostagemSchema.safeParse(request.params);
  if (!paramValidation.success) {
    response.status(400).json({
      msg: "Numero de identificação está inválido",
      detalhes: formatZodError(paramValidation.error),
    });
    return;
  }

  const { id } = request.params;
  const { titulo, conteudo, imagem } = request.body;

  const postagemAtualizada = {
    titulo,
    conteudo,
    imagem,
  };
  try {
    const [linhasAfetadas] = await Postagem.update(postagemAtualizada, {
      where: { id },
    });
    if (linhasAfetadas === 0) {
      response.status(404).json({ msg: "Postagem não encontrada" });
      return;
    }
    response.status(200).json({ msg: "Postagem Atualizada" });
  } catch (error) {
    response.status(500).json({ msg: "Erro ao atualizar Postagem" });
  }
};

export const deletePostagem = async (request, response) => {
  const { id } = request.params;

  try {
    const [linhasAfetadas] = await Postagem.destroy({
      where: { id },
    });
    if (linhasAfetadas === 0) {
      response.status(404).json({ msg: "Postagem não encontrada" });
      return;
    }
    response.status(200).json({ msg: "Postagem deletada" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Erro ao deletar Postagem" });
  }
};

export const uploadImagePostagem = async (request, response) => {
  const { id } = request.params;
  const nomeImagem = `${id}.jpg`;

  let imagem;
  if (request.file) {
    imagem = request.file.filename;
  } else {
    imagem = "postagemDefault.png";
  }
  try {
    const [linhasAfetadas] = await Postagem.update(
      { imagem: nomeImagem },
      {
        where: { id },
      }
    );
    if (linhasAfetadas === 0) {
      response.status(404).json({ msg: "Postagem não encontrada" });
      return;
    }
    response.status(200).json({ msg: "Imagem Atualizada" });
  } catch (error) {
    response.status(500).json({ msg: "Erro ao atualizar Imagem" });
  }
};
