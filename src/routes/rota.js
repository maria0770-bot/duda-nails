const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

//  inicio
router.get("/", (req, res) => {
res.status(200).json({
msg: "Bem-vindo ao Duda Nails!"
});
});

// Lista os clientes

router.get("/clientes", verificarToken, async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({
        erro: "Apenas a administradora pode visualizar todos os clientes."
      });
    }

    const resultado = await db.query(
      "SELECT * FROM clientes ORDER BY id"
    );

    res.status(200).json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar clientes."
    });
  }
});


// Lista serviços
router.get("/servicos", async (req, res) => {
try {
const resultado = await db.query(
"SELECT * FROM servicos ORDER BY id"
);

res.status(200).json(resultado.rows);
} catch (erro) {
console.error(erro);
res.status(500).json({
erro: "Erro ao buscar serviços."
});
}
});

// Busca o cliente pelo ID

router.get("/clientes/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    let resultado;

    if (req.usuario.tipo === "admin") {
      resultado = await db.query(
        "SELECT * FROM clientes WHERE id = $1",
        [id]
      );
    } else {
      resultado = await db.query(
        "SELECT * FROM clientes WHERE id = $1 AND usuario_id = $2",
        [id, req.usuario.id]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado."
      });
    }

    res.status(200).json(resultado.rows[0]);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar cliente."
    });
  }
});

// Cadastrar um cliente
router.post("/clientes", verificarToken, async (req, res) => {
try {
const { nome, telefone, referencias } = req.body;

if (!nome) {
return res.status(400).json({
erro: "Nome é obrigatório."
});
}

const resultado = await db.query(
`INSERT INTO clientes (nome, telefone, referencias)
VALUES ($1, $2, $3)
RETURNING *`,
[nome, telefone, referencias || null]
);

res.status(201).json(resultado.rows[0]);
} catch (erro) {
console.error(erro);
res.status(500).json({
erro: "Erro ao cadastrar cliente."
});
}
});

// Edita cliente

router.put("/clientes/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, telefone, referencias } = req.body;

    if (!nome) {
      return res.status(400).json({
        erro: "Nome é obrigatório."
      });
    }

    let resultado;

    if (req.usuario.tipo === "admin") {
      resultado = await db.query(
        `UPDATE clientes
         SET nome = $1, telefone = $2, referencias = $3
         WHERE id = $4
         RETURNING *`,
        [nome, telefone, referencias || null, id]
      );
    } else {
      resultado = await db.query(
        `UPDATE clientes
         SET nome = $1, telefone = $2, referencias = $3
         WHERE id = $4 AND usuario_id = $5
         RETURNING *`,
        [nome, telefone, referencias || null, id, req.usuario.id]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado."
      });
    }

    res.status(200).json(resultado.rows[0]);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao editar cliente."
    });
  }
});



 // Cadastra um serviço
router.post("/servicos", verificarToken, async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({
        erro: "Apenas a administradora pode cadastrar serviços."
      });
    }

    const { nome, preco, referencias } = req.body;

    if (!nome || preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        erro: "Nome e preço são obrigatórios."
      });
    }

    const resultado = await db.query(
      `INSERT INTO servicos (nome, preco, referencias)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, preco, referencias || null]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao cadastrar serviço."
    });
  }
});

  // Exclui cliente
router.delete("/clientes/:id", verificarToken, async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({
        erro: "Apenas a administradora pode excluir clientes."
      });
    }

    const id = req.params.id;

    const resultado = await db.query(
      "DELETE FROM clientes WHERE id = $1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Cliente excluído com sucesso.",
      cliente: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao excluir cliente."
    });
  }
});


 // Edita serviço
router.put("/servicos/:id", verificarToken, async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({
        erro: "Apenas a administradora pode editar serviços."
      });
    }

    const id = req.params.id;
    const { nome, preco, referencias } = req.body;

    if (!nome || preco === undefined || preco === null || preco === "") {
      return res.status(400).json({
        erro: "Nome e preço são obrigatórios."
      });
    }

    const resultado = await db.query(
      `UPDATE servicos
       SET nome = $1, preco = $2, referencias = $3
       WHERE id = $4
       RETURNING *`,
      [nome, preco, referencias || null, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Serviço não encontrado."
      });
    }

    res.status(200).json(resultado.rows[0]);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao editar serviço."
    });
  }
});



 // Exclui serviço
router.delete("/servicos/:id", verificarToken, async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({
        erro: "Apenas a administradora pode excluir serviços."
      });
    }

    const id = req.params.id;

    const resultado = await db.query(
      "DELETE FROM servicos WHERE id = $1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Serviço não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Serviço excluído com sucesso.",
      servico: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao excluir serviço."
    });
  }
});

// Listar agendamentos
router.get("/agendamentos", verificarToken, async (req, res) => {
  try {
    let resultado;

    if (req.usuario.tipo === "admin") {
      resultado = await db.query(
        `SELECT * FROM agendamentos ORDER BY data, horario`
      );
    } else {
      const cliente = await db.query(
        "SELECT id FROM clientes WHERE usuario_id = $1",
        [req.usuario.id]
      );

      if (cliente.rows.length === 0) {
        return res.status(404).json({
          erro: "Cadastro de cliente não encontrado."
        });
      }

      resultado = await db.query(
        `SELECT * FROM agendamentos
         WHERE cliente_id = $1
         ORDER BY data, horario`,
        [cliente.rows[0].id]
      );
    }

    res.status(200).json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar agendamentos."
    });
  }
});


// Cadastrar usuário e criar perfil de cliente
router.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios."
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        erro: "A senha deve ter pelo menos 6 caracteres."
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await db.transaction(async (conexao) => {
      const resultado = await conexao.query(
        `INSERT INTO usuarios (nome, email, senha)
         VALUES ($1, $2, $3)
         RETURNING id, nome, email, tipo`,
        [nome, email, senhaCriptografada]
      );

      const novoUsuario = resultado.rows[0];

      await conexao.query(
        `INSERT INTO clientes (nome, usuario_id)
         VALUES ($1, $2)`,
        [nome, novoUsuario.id]
      );

      return novoUsuario;
    });

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      usuario
    });

  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(409).json({
        erro: "Este email já está cadastrado."
      });
    }

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao cadastrar usuário."
    });
  }
});

// Fazer login
router.post("/login", async (req, res) => {
  try {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
  return res.status(400).json({
  erro: "Email e senha são obrigatórios."
  });
  }
  
  const resultado = await db.query(
  "SELECT * FROM usuarios WHERE email = $1",
  [email]
  );
  
  if (resultado.rows.length === 0) {
  return res.status(401).json({
  erro: "Email ou senha incorretos."
  });
  }
  
  const usuario = resultado.rows[0];
  
  const senhaCorreta = await bcrypt.compare(
  senha,
  usuario.senha
  );
  
  if (!senhaCorreta) {
  return res.status(401).json({
  erro: "Email ou senha incorretos."
  });
  }
  
  const token = jwt.sign(
  {
  id: usuario.id,
  tipo: usuario.tipo
  },
  process.env.JWT_SECRET,  { expiresIn: "1h" }
  );
  
  res.status(200).json({
  mensagem: "Login realizado com sucesso.",
  token: token
  });
  
  } catch (erro) {
  console.error(erro);
  res.status(500).json({
  erro: "Erro ao realizar login."
  });
  }
  });
  
// Enviar foto ou vídeo de referência de um serviço
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
router.post("/agendamentos", verificarToken, async (req, res) => {
  try {
    const { data, horario, servicos } = req.body;

    if (
      !data ||
      !horario ||
      !Array.isArray(servicos) ||
      servicos.length === 0
    ) {
      return res.status(400).json({
        erro: "Informe data, horário e pelo menos um serviço."
      });
    }

    const ids = servicos.map(Number);

    if (
      ids.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(ids).size !== ids.length
    ) {
      return res.status(400).json({
        erro: "Informe serviços válidos, sem repetição."
      });
    }

    const cliente = await db.query(
      "SELECT id FROM clientes WHERE usuario_id = $1",
      [req.usuario.id]
    );

    if (cliente.rows.length === 0) {
      return res.status(404).json({
        erro: "Seu cadastro de cliente não foi encontrado."
      });
    }

    const resultado = await db.transaction(async (conexao) => {
      const existentes = await conexao.query(
        "SELECT id FROM servicos WHERE id = ANY($1::int[])",
        [ids]
      );

      if (existentes.rows.length !== ids.length) {
        const erro = new Error("Um ou mais serviços não existem.");
        erro.status = 400;
        throw erro;
      }

      const agendamento = await conexao.query(
        `INSERT INTO agendamentos (cliente_id, data, horario)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [cliente.rows[0].id, data, horario]
      );

      for (const servicoId of ids) {
        await conexao.query(
          `INSERT INTO agendamento_servicos
           (agendamento_id, servico_id)
           VALUES ($1, $2)`,
          [agendamento.rows[0].id, servicoId]
        );
      }

      return agendamento.rows[0];
    });

    res.status(201).json({
      mensagem: "Agendamento realizado com sucesso!",
      agendamento: resultado,
      servicos: ids
    });

  } catch (erro) {
    console.error(erro);

    res.status(erro.status || 500).json({
      erro: erro.status
        ? erro.message
        : "Erro ao cadastrar agendamento."
    });
  }
}); 


// Listar fotos e vídeos de um serviço
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

module.exports = router;



