const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../auth");

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

    if (
      (typeof preco !== "number" && typeof preco !== "string") ||
      String(preco).trim() === "" ||
      !Number.isFinite(Number(preco)) ||
      Number(preco) < 0
    ) {
      return res.status(400).json({
        erro: "O preço deve ser um número válido e não pode ser negativo."
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

    if (
      (typeof preco !== "number" && typeof preco !== "string") ||
      String(preco).trim() === "" ||
      !Number.isFinite(Number(preco)) ||
      Number(preco) < 0
    ) {
      return res.status(400).json({
        erro: "O preço deve ser um número válido e não pode ser negativo."
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
  if (erro.code === "23503") {
    return res.status(409).json({
      erro: "Não é possível excluir este serviço, pois ele está vinculado a agendamentos ou referências."
    });
  }

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao excluir serviço."
    });
  }
});

// Listar agendamentos

module.exports = router;
