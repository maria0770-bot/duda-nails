const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
const autorizacao = req.headers.authorization;

if (!autorizacao) {
return res.status(401).json({
erro: "Token não informado."
});
}

const partes = autorizacao.split(" ");

if (partes.length !== 2 || partes[0] !== "Bearer") {
return res.status(401).json({
erro: "Formato do token inválido."
});
}

try {
const segredo = process.env.JWT_SECRET;

const dados = jwt.verify(partes[1], segredo);

req.usuario = dados;

next();
} catch (erro) {
return res.status(401).json({
erro: "Token inválido ou expirado."
});
}
}

module.exports = verificarToken;