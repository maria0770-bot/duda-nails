const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios."
      });
    }

   if (senha.length < 8) {
  return res.status(400).json({
    erro: "A senha deve ter pelo menos 8 caracteres."
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
  `INSERT INTO clientes (nome, telefone, usuario_id)
   VALUES ($1, $2, $3)`,
  [nome, telefone || null, novoUsuario.id]
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
  process.env.JWT_SECRET, { expiresIn: "1h" }  
);
  
  res.status(200).json({
    mensagem: "Login realizado com sucesso.",
    token: token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      tipo: usuario.tipo
    }
  });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
    erro: "Erro ao realizar login."
    });
  }
});
  
// Enviar foto ou vídeo de referência de um serviço

module.exports = router;
