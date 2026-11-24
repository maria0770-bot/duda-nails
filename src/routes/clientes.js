const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../auth");

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

module.exports = router;
