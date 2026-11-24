const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../auth");

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

    // Validar formato da data e do horário
    if (
      typeof data !== "string" ||
      typeof horario !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)
    ) {
      return res.status(400).json({
        erro: "Data ou horário inválido."
      });
    }

    const ids = servicos.map(Number);

    // Validar se a data existe
    const dataValida = new Date(`${data}T00:00:00Z`);

    if (
      isNaN(dataValida.getTime()) ||
      dataValida.toISOString().slice(0, 10) !== data
    ) {
      return res.status(400).json({
        erro: "Informe uma data válida."
      });
    }

    // Impedir agendamentos no passado
    const dataAgendamento = new Date(`${data}T${horario}:00-03:00`);

    if (dataAgendamento <= new Date()) {
      return res.status(400).json({
        erro: "Não é possível realizar agendamentos no passado."
      });
    }

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

// Cancelar agendamento
router.delete("/agendamentos/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    await db.transaction(async (conexao) => {
      const resultado = await conexao.query(
        `SELECT agendamentos.id, clientes.usuario_id
         FROM agendamentos
         JOIN clientes ON clientes.id = agendamentos.cliente_id
         WHERE agendamentos.id = $1
         FOR UPDATE OF agendamentos`,
        [id]
      );

      if (resultado.rows.length === 0) {
        const erro = new Error("Agendamento não encontrado.");
        erro.status = 404;
        throw erro;
      }

      if (
        req.usuario.tipo !== "admin" &&
        resultado.rows[0].usuario_id !== req.usuario.id
      ) {
        const erro = new Error("Você não pode cancelar este agendamento.");
        erro.status = 403;
        throw erro;
      }

      await conexao.query(
        "DELETE FROM agendamento_servicos WHERE agendamento_id = $1",
        [id]
      );

      await conexao.query(
        "DELETE FROM agendamentos WHERE id = $1",
        [id]
      );
    });

    res.status(200).json({
      mensagem: "Agendamento cancelado com sucesso!"
    });

  } catch (erro) {
    console.error(erro);

    res.status(erro.status || 500).json({
      erro: erro.status
        ? erro.message
        : "Erro ao cancelar agendamento."
    });
  }
});

// Listar fotos e vídeos de um serviço

module.exports = router;
