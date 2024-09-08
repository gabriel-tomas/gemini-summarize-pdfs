import { Request, Response } from "express";

import { model } from "./config/googleGenAi";

export const resumePdf = async (req: Request, res: Response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'NO_FILE', description: 'É obrigatório o envio de `file` sendo pdf' });
  }

  const uploadedFiles = req.files;

  if (Object.keys(uploadedFiles).length > 3) {
    return res.status(400).json({ error: 'MAX_FILE_COUNT_EXCEEDED', description: 'Só é permitido enviar até 3 arquivos' });
  }

  let filesAreValid = true;
  const filesDataBuffer: any[] = [];

  Object.values(uploadedFiles).forEach((value) => {
    if (!filesAreValid) return;
    if (!Array.isArray(value) && value.mimetype !== 'application/pdf') {
      filesAreValid = false;
      return res.status(400).json({
        error: 'INVALID_FILE_TYPE',
        description: `Arquivo ${value.name} não é um PDF`
      });
    }
    if (!Array.isArray(value) && value.size >= 9985760) {
      filesAreValid = false;
      return res.status(400).json({
        error: 'FILE_SIZE_EXCEEDED',
        description: `Arquivo ${value.name} excedeu o limite de 10MB`
      });
    }
    !Array.isArray(value) && filesDataBuffer.push({
      inlineData: { data: value.data.toString('base64'), mimeType: value.mimetype }
    });
  })

  if (!filesAreValid) return;

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'PROMPT_REQUIRED', description: 'É obrigatório o envio de `prompt`' });
  } else if (typeof prompt !== 'string') {
    return res.status(400).json({ error: 'PROMPT_FORMAT_ERROR', description: '`prompt` deve ser uma string' });
  }

  try {
    const generatedContent = await model.generateContent([
      "REGRAS: Use português brasileiro como linguagem primária, só use outra língua se o usuário pedir. Prompt do usuário: " + prompt
    , ...filesDataBuffer]);

    return res.status(200).json({ content: generatedContent.response.text() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', description: 'Ocorreu um erro interno no servidor' });
  }
};
