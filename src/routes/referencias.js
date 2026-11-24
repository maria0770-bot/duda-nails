const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../auth");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm"
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Envie uma imagem ou vídeo em formato permitido."));
        }
    }
});

router.post(
  "/servicos/:id/referencias",
  verificarToken,
  upload.single("arquivo"),
  async (req, res) => {
    try {
      if (req.usuario.tipo !== "admin") {
        return res.status(403).json({
          erro: "Apenas a administradora pode enviar referências dos serviços."
        });
      }

      if (!req.file) {
        return res.status(400).json({
          erro: "Selecione uma foto ou vídeo."
        });
      }

      const servico = await db.query(
        "SELECT id FROM servicos WHERE id = $1",
        [req.params.id]
      );

      if (servico.rows.length === 0) {
        return res.status(404).json({
          erro: "Serviço não encontrado."
        });
      }

      const resultado = await db.query(
        `INSERT INTO referencias
         (nome_original, tipo_mime, tamanho_bytes, conteudo, servico_id, enviado_por)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nome_original, tipo_mime, servico_id`,
        [
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          req.file.buffer,
          req.params.id,
          req.usuario.id
        ]
      );

      res.status(201).json(resultado.rows[0]);

    } catch (erro) {
      console.error(erro);
      res.status(500).json({
        erro: "Erro ao salvar referência."
      });
    }
  }
);

// Cliente envia foto de referência da unha desejada
router.post(
  "/clientes/:id/referencias",
  verificarToken,
  upload.single("arquivo"),
  async (req, res) => {
    try {
      const cliente = await db.query(
        "SELECT id, usuario_id FROM clientes WHERE id = $1",
        [req.params.id]
      );

      if (cliente.rows.length === 0) {
        return res.status(404).json({
          erro: "Cliente não encontrada."
        });
      }

      if (
        req.usuario.tipo !== "admin" &&
        cliente.rows[0].usuario_id !== req.usuario.id
      ) {
        return res.status(403).json({
          erro: "Você não pode enviar referências para outra cliente."
        });
      }

      if (!req.file) {
        return res.status(400).json({
          erro: "Selecione uma foto."
        });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          erro: "A referência da cliente deve ser uma imagem."
        });
      }

      const resultado = await db.query(
        `INSERT INTO referencias
         (nome_original, tipo_mime, tamanho_bytes, conteudo, cliente_id, enviado_por)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nome_original, tipo_mime, cliente_id`,
        [
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          req.file.buffer,
          req.params.id,
          req.usuario.id
        ]
      );

      res.status(201).json(resultado.rows[0]);

    } catch (erro) {
      console.error(erro);
      res.status(500).json({
        erro: "Erro ao salvar referência da cliente."
      });
    }
  }
);

// Visualizar foto ou vídeo de referência
router.get("/referencias/:id", verificarToken, async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT r.*, c.usuario_id
       FROM referencias r
       LEFT JOIN clientes c ON r.cliente_id = c.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Referência não encontrada."
      });
    }

    const referencia = resultado.rows[0];

    if (
      referencia.cliente_id !== null &&
      req.usuario.tipo !== "admin" &&
      referencia.usuario_id !== req.usuario.id
    ) {
      return res.status(403).json({
        erro: "Você não tem permissão para visualizar esta referência."
      });
    }

    res.setHeader("Content-Type", referencia.tipo_mime);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(referencia.conteudo);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao buscar referência."
    });
  }
});

// Cadastrar agendamento com vários serviços
router.get("/servicos/:id/referencias", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT id, nome_original, tipo_mime, servico_id
       FROM referencias
       WHERE servico_id = $1
       ORDER BY id`,
      [req.params.id]
    );

    res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao listar referências do serviço."
    });
  }
});


 // Exibir fotos e vídeos públicos dos serviços
router.get("/servicos/referencias/:id", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT conteudo, tipo_mime
       FROM referencias
       WHERE id = $1
       AND servico_id IS NOT NULL`,
      [req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Foto do serviço não encontrada."
      });
    }
    const foto = resultado.rows[0];

    res.setHeader("Content-Type", foto.tipo_mime);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(foto.conteudo);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao carregar foto."
    });
  }
});

// Tratamento de erros no upload
router.use((erro, req, res, next) => {
  if (erro instanceof multer.MulterError) {
    return res.status(400).json({
      erro: erro.code === "LIMIT_FILE_SIZE"
        ? "O arquivo deve ter no máximo 10 MB."
        : "Erro ao enviar arquivo."
    });
  }

  if (erro.message === "Envie uma imagem ou vídeo em formato permitido.") {
    return res.status(400).json({
      erro: erro.message
    });
  }

  next(erro);
});

// Excluir referência
router.delete("/referencias/:id", verificarToken, async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({
        erro: "Apenas a administradora pode excluir referências."
      });
    }

    const resultado = await db.query(
      "DELETE FROM referencias WHERE id = $1 AND servico_id IS NOT NULL RETURNING id",
      [req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Referência do serviço não encontrada."
      });
    }

    res.status(200).json({
      mensagem: "Referência excluída com sucesso!"
    });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao excluir referência."
    });
  }
});


router.get("/clientes/:id/referencias", verificarToken, async (req, res) => {
  try {
    const cliente = await db.query(
      "SELECT id, usuario_id FROM clientes WHERE id = $1",
      [req.params.id]
    );

    if (cliente.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrada."
      });
    }

    if (
      req.usuario.tipo !== "admin" &&
      cliente.rows[0].usuario_id !== req.usuario.id
    ) {
      return res.status(403).json({
        erro: "Você não tem permissão para visualizar essas referências."
      });
    }

    const resultado = await db.query(
      `SELECT id, nome_original, tipo_mime, cliente_id
       FROM referencias
       WHERE cliente_id = $1
       ORDER BY id`,
      [req.params.id]
    );

    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao listar referências da cliente."
    });
  }
});


router.get("/clientes/me/perfil", verificarToken, async (req, res) => {
  try {
    const resultado = await db.query(
      "SELECT id, nome, telefone FROM clientes WHERE usuario_id = $1",
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Cadastro de cliente não encontrado."
      });
    }

    res.status(200).json(resultado.rows[0]);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar perfil da cliente."
    });
  }
});


module.exports = router;
