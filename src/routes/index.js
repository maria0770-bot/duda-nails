const express = require("express");
const router = express.Router();

// Página inicial da API
router.get("/", (req, res) => {
  res.status(200).json({
    msg: "Bem-vindo ao Duda Nails!"
  });
});

// Importar as rotas
router.use(require("./clientes"));
router.use(require("./servicos"));
router.use(require("./agendamentos"));
router.use(require("./usuarios"));
router.use(require("./referencias"));

module.exports = router;