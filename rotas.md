
# Documentação da API — Duda Nails

## Sobre o projeto

O Duda Nails é um sistema de agendamento de serviços de unhas, desenvolvido com Node.js, Express e PostgreSQL.

A API permite cadastrar clientes, consultar serviços, realizar agendamentos e enviar imagens de referência.

## Endereço da API

http://localhost:3000/hello

## 1. Página inicial

**Método:** GET  
**Rota:** `/`

**Descrição:** Retorna uma mensagem de boas-vindas.

**Autenticação:** Não precisa.

**Parâmetros:** Nenhum.

**Exemplo de resposta:**

```json
{
  "msg": "Bem-vindo ao Duda Nails!"
}
```

## 2. Listar serviços

**Método:** GET  
**Rota:** `/servicos`

**Descrição:** Mostra todos os serviços disponíveis.

**Autenticação:** Não precisa.

**Parâmetros:** Nenhum.

**Exemplo de resposta:**

```json
[
  {
    "id": 1,
    "nome": "Manicure",
    "preco": "30.00",
    "referencias": "Referência 1"
  }
]
```

## 3. Cadastrar usuário

**Método:** POST  
**Rota:** `/usuarios`

**Descrição:** Cadastra um novo usuário no sistema. Quando o usuário é cliente, também é criado seu cadastro na tabela de clientes.

**Autenticação:** Não precisa.

**Parâmetros obrigatórios:**
- `nome`: nome do usuário.
- `email`: e-mail do usuário.
- `senha`: senha com pelo menos 6 caracteres.

**Exemplo de requisição:**

```json
{
  "nome": "Ana Clara",
  "email": "ana@example.com",
  "senha": "senha123"
}
```

**Resposta:** Retorna os dados do usuário cadastrado, sem mostrar a senha.

## 4. Fazer login

**Método:** POST  
**Rota:** `/login`

**Descrição:** Permite que o usuário entre no sistema e receba um token JWT.

**Autenticação:** Não precisa.

**Parâmetros obrigatórios:**
- `email`: e-mail cadastrado.
- `senha`: senha cadastrada.

**Exemplo de requisição:**

```json
{
  "email": "ana@example.com",
  "senha": "senha123"
}
```

**Exemplo de resposta:**

```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "TOKEN_JWT_GERADO"
}
```

**Observação:** O token é válido por 1 hora e deve ser enviado nas rotas protegidas:

`Authorization: Bearer TOKEN_JWT`


## 5. Listar clientes

**Método:** GET  
**Rota:** `/clientes`

**Descrição:** Lista todos os clientes cadastrados.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetros:** Nenhum.

**Exemplo de resposta:**

```json
[
  {
    "id": 1,
    "nome": "Maria Eduarda",
    "telefone": "11999999999"
  }
]
```

## 6. Buscar cliente pelo ID

**Método:** GET  
**Rota:** `/clientes/:id`

**Descrição:** Mostra os dados de um cliente específico.

**Autenticação:** Precisa de token JWT.

**Permissão:** O administrador pode consultar qualquer cliente. O cliente comum só pode consultar seu próprio cadastro.

**Parâmetros:**
- `id`: identificação do cliente na URL.

**Exemplo de requisição:**

GET `/clientes/1`

**Exemplo de resposta:**

```json
{
  "id": 1,
  "nome": "Maria Eduarda",
  "telefone": "11999999999"
}
```

## 7. Cadastrar cliente

**Método:** POST  
**Rota:** `/clientes`

**Descrição:** Cadastra um novo cliente.

**Autenticação:** Precisa de token JWT.

**Parâmetros obrigatórios:**
- `nome`: nome do cliente.
- `telefone`: telefone do cliente.

**Parâmetro opcional:**
- `referencias`: descrição de uma referência para as unhas.

**Exemplo de requisição:**

```json
{
  "nome": "Ana Clara",
  "telefone": "11988888888",
  "referencias": "Unhas francesinhas"
}
```

## 8. Atualizar cliente

**Método:** PUT  
**Rota:** `/clientes/:id`

**Descrição:** Atualiza os dados de um cliente.

**Autenticação:** Precisa de token JWT.

**Permissão:** Administrador ou o próprio cliente.

**Parâmetros:**
- `id`: identificação do cliente.
- `nome`: nome atualizado.
- `telefone`: telefone atualizado.
- `referencias`: referência atualizada, quando aplicável.

## 9. Excluir cliente

**Método:** DELETE  
**Rota:** `/clientes/:id`

**Descrição:** Exclui um cliente cadastrado.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetro:**
- `id`: identificação do cliente que será excluído.


## 10. Cadastrar serviço

**Método:** POST  
**Rota:** `/servicos`

**Descrição:** Cadastra um novo serviço de unhas.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetros obrigatórios:**
- `nome`: nome do serviço.
- `preco`: preço do serviço.

**Exemplo de requisição:**

```json
{
  "nome": "Banho de gel",
  "preco": 70
}
```

## 11. Atualizar serviço

**Método:** PUT  
**Rota:** `/servicos/:id`

**Descrição:** Atualiza os dados de um serviço.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetros:**
- `id`: identificação do serviço na URL.
- `nome`: nome atualizado.
- `preco`: preço atualizado.

**Exemplo de requisição:**

PUT `/servicos/1`

```json
{
  "nome": "Manicure",
  "preco": 35
}
```

## 12. Excluir serviço

**Método:** DELETE  
**Rota:** `/servicos/:id`

**Descrição:** Exclui um serviço cadastrado.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetro:**
- `id`: identificação do serviço que será excluído.

**Exemplo de requisição:**

DELETE `/servicos/1`

**Possíveis respostas de erro:**
- `401`: usuário não autenticado.
- `403`: usuário sem permissão.
- `404`: serviço não encontrado.


## 13. Listar agendamentos

**Método:** GET  
**Rota:** `/agendamentos`

**Descrição:** Lista os agendamentos cadastrados no sistema.

**Autenticação:** Precisa de token JWT.

**Permissões:**
- Administrador: pode visualizar todos os agendamentos.
- Cliente: pode visualizar apenas seus próprios agendamentos.

**Parâmetros:** Nenhum.

**Exemplo de resposta:**

```json
[
  {
    "id": 4,
    "cliente_id": 4,
    "data": "2026-11-20",
    "horario": "14:00:00"
  }
]
```

## 14. Criar agendamento

**Método:** POST  
**Rota:** `/agendamentos`

**Descrição:** Permite criar um agendamento para um ou mais serviços de unhas.

**Autenticação:** Precisa de token JWT.

**Parâmetros obrigatórios:**
- `data`: data do agendamento.
- `horario`: horário escolhido.
- `servicos`: lista com os IDs dos serviços desejados.

**Exemplo de requisição:**

```json
{
  "data": "2026-11-20",
  "horario": "14:00",
  "servicos": [1, 2]
}
```

**Observações:**
- O cliente comum realiza agendamentos para si mesmo.
- O administrador também pode realizar agendamentos para outros clientes, informando `cliente_id`.
- Um agendamento pode incluir vários serviços por meio da tabela `agendamento_servicos`.

**Exemplo de resposta de sucesso:**

O sistema retorna os dados do agendamento criado, incluindo seu ID.


## 15. Enviar referência de um serviço

**Método:** POST  
**Rota:** `/servicos/:id/referencias`

**Descrição:** Permite adicionar fotos ou vídeos como exemplos dos serviços de unhas.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetros:**
- `id`: identificação do serviço.
- Arquivo de imagem ou vídeo enviado pelo formulário.

**Formatos permitidos:**
- Imagens: JPG, PNG e WEBP.
- Vídeos: MP4 e WEBM.

**Tamanho máximo:** 10 MB.

**Tipo de envio:** `multipart/form-data`.

## 16. Enviar referência de um cliente

**Método:** POST  
**Rota:** `/clientes/:id/referencias`

**Descrição:** Permite que o cliente envie uma foto mostrando como deseja fazer suas unhas.

**Autenticação:** Precisa de token JWT.

**Permissão:** O próprio cliente ou um administrador.

**Parâmetros:**
- `id`: identificação do cliente.
- Arquivo de imagem enviado pelo formulário.

**Formatos permitidos:** JPG, PNG e WEBP.

**Tamanho máximo:** 10 MB.

**Tipo de envio:** `multipart/form-data`.

## 17. Visualizar uma referência protegida

**Método:** GET  
**Rota:** `/referencias/:id`

**Descrição:** Retorna o arquivo de uma referência cadastrada.

**Autenticação:** Precisa de token JWT.

**Permissões:**
- Administradores podem visualizar as referências.
- Clientes podem visualizar suas próprias referências.
- Referências de serviços também podem ser visualizadas por usuários autenticados.

**Parâmetro:**
- `id`: identificação da referência.

**Resposta:** Arquivo de imagem ou vídeo.

## 18. Listar referências de um serviço

**Método:** GET  
**Rota:** `/servicos/:id/referencias`

**Descrição:** Lista as referências cadastradas para determinado serviço.

**Autenticação:** Não precisa.

**Parâmetro:**
- `id`: identificação do serviço.

**Resposta:** Lista com informações das referências disponíveis.

## 19. Visualizar imagem ou vídeo de um serviço

**Método:** GET  
**Rota:** `/servicos/referencias/:id`

**Descrição:** Permite visualizar publicamente uma imagem ou vídeo de um serviço.

**Autenticação:** Não precisa.

**Parâmetro:**
- `id`: identificação da referência.

**Resposta:** Arquivo de imagem ou vídeo.

**Observação:** Essa rota não permite acessar referências particulares dos clientes.
