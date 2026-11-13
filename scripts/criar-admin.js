const bcrypt = require("bcrypt");
const readline = require("readline");
const db = require("../src/db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function perguntar(texto) {
  return new Promise((resolve) => {
    rl.question(texto, resolve);
  });
}

async function criarAdmin() {
  try {
    const nome = await perguntar("Nome do administrador: ");
    const email = await perguntar("Email do administrador: ");
    const senha = await perguntar("Senha do administrador: ");

    if (!nome.trim() || !email.trim() || senha.length < 8) {
      console.log("Preencha nome, email e uma senha de pelo menos 8 caracteres.");
      return;
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await db.query(
      `INSERT INTO usuarios (nome, email, senha, tipo)
       VALUES ($1, $2, $3, 'admin')`,
      [nome.trim(), email.trim(), senhaCriptografada]
    );

    console.log("Administrador criado com sucesso!");
  } catch (erro) {
    if (erro.code === "23505") {
      console.log("Este email ja esta cadastrado.");
    } else {
      console.error("Erro ao criar administrador:", erro.message);
    }
  } finally {
    rl.close();
    process.exit();
  }
}

criarAdmin();