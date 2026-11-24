
# Documentação da API — Duda Nails

## Sobre o projeto

O Duda Nails é um sistema de agendamento de serviços de unhas, desenvolvido com Node.js, Express e PostgreSQL.

A API permite cadastrar clientes, consultar serviços, realizar agendamentos e enviar imagens de referência.

## Endereço da API

http://localhost:3000/api

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

**Exemplo de resposta de sucesso (201):**

```json
{
  "mensagem": "Cadastro realizado com sucesso!",
  "usuario": {
    "id": 4,
    "nome": "Ana Clara",
    "email": "ana@example.com",
    "tipo": "cliente"
  }
}
```

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

**Parâmetro obrigatório:**
- `nome`: nome do cliente.

**Parâmetros opcionais:**
- `telefone`: telefone do cliente.
- `referencias`: descrição de uma referência para as unhas.

**Exemplo de requisição:**

```json
{
  "nome": "Ana Clara",
  "telefone": "11988888888",
  "referencias": "Unhas francesinhas"
}
```
**Exemplo de resposta de sucesso (201):**

```json
{
  "id": 4,
  "nome": "Ana Clara",
  "telefone": "11988888888",
  "referencias": "Unhas francesinhas",
  "usuario_id": null
}
```

## 8. Atualizar cliente

**Método:** PUT  
**Rota:** `/clientes/:id`

**Descrição:** Atualiza os dados de um cliente.

**Autenticação:** Precisa de token JWT.

**Permissão:** Administrador ou o próprio cliente.

**Parâmetro obrigatório:**
- `nome`: nome atualizado do cliente.

**Parâmetros opcionais:**
- `telefone`: telefone atualizado.
- `referencias`: referência atualizada.

**Exemplo de requisição:**

PUT `/clientes/4`

```json
{
  "nome": "Ana Clara",
  "telefone": "11999999999",
  "referencias": "Unhas vermelhas"
}
```

**Exemplo de resposta de sucesso (200):**

```json
{
  "id": 4,
  "nome": "Ana Clara",
  "telefone": "11999999999",
  "referencias": "Unhas vermelhas",
  "usuario_id": null
}
```

## 9. Excluir cliente

**Método:** DELETE  
**Rota:** `/clientes/:id`

**Descrição:** Exclui um cliente cadastrado.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetro:**
- `id`: identificação do cliente que será excluído.

**Exemplo de requisição:**

DELETE `/clientes/4`

**Exemplo de resposta de sucesso (200):**

```json
{
  "mensagem": "Cliente excluído com sucesso.",
  "cliente": {
    "id": 4,
    "nome": "Ana Clara",
    "telefone": "11999999999",
    "referencias": "Unhas vermelhas",
    "usuario_id": null
  }
}
```

**Possíveis respostas de erro:**
- `403`: usuário sem permissão para excluir clientes.
- `404`: cliente não encontrado.
- `500`: erro ao excluir cliente.

## 10. Cadastrar serviço

**Método:** POST  
**Rota:** `/servicos`

**Descrição:** Cadastra um novo serviço de unhas.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetros obrigatórios:**
- `nome`: nome do serviço.
- `preco`: preço do serviço.

**Parâmetro opcional:**
- `referencias`: descrição de uma referência para o serviço.

**Exemplo de resposta de sucesso (201):**

```json
{
  "id": 5,
  "nome": "Banho de gel",
  "preco": "70.00",
  "referencias": null
}
```

**Possíveis respostas de erro:**
- `400`: nome ou preço não informado.
- `403`: usuário sem permissão para cadastrar serviços.
- `500`: erro ao cadastrar serviço.

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

**Exemplo de requisição:**

PUT `/servicos/1`

```json
{
  "nome": "Manicure",
  "preco": 35
}
```
**Parâmetros obrigatórios:**
- `id`: identificação do serviço na URL.
- `nome`: nome atualizado.
- `preco`: preço atualizado.

**Parâmetro opcional:**
- `referencias`: descrição de uma referência para o serviço.

**Exemplo de resposta de sucesso (200):**

```json
{
  "id": 1,
  "nome": "Manicure",
  "preco": "35.00",
  "referencias": null
}
```

**Possíveis respostas de erro:**
- `400`: nome ou preço não informado.
- `403`: usuário sem permissão para editar serviços.
- `404`: serviço não encontrado.
- `500`: erro ao editar serviço.

## 12. Excluir serviço

**Método:** DELETE  
**Rota:** `/servicos/:id`

**Descrição:** Exclui um serviço cadastrado.

**Autenticação:** Precisa de token JWT.

**Permissão:** Apenas administradores.

**Parâmetro:**
- `id`: identificação do serviço que será excluído.

**Exemplo de requisição:**

DELETE `/servicos/5`

**Exemplo de resposta de sucesso (200):**

```json
{
  "mensagem": "Serviço excluído com sucesso.",
  "servico": {
    "id": 5,
    "nome": "Banho de gel",
    "preco": "70.00",
    "referencias": null
  }
}
```

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
- Um agendamento pode incluir vários serviços por meio da tabela `agendamento_servicos`.

**Exemplo de resposta de sucesso (201):**

```json
{
  "mensagem": "Agendamento realizado com sucesso!",
  "agendamento": {
    "id": 4,
    "cliente_id": 4,
    "data": "2026-11-20",
    "horario": "14:00:00"
  },
  "servicos": [1, 2]
}
```

**Possíveis respostas de erro:**
- `400`: dados obrigatórios ausentes ou serviços inválidos.
- `404`: cadastro de cliente não encontrado.
- `500`: erro ao cadastrar agendamento.
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


**Nome do campo do arquivo:** `arquivo`

**Exemplo de resposta de sucesso (201):**

```json
{
  "id": 1,
  "nome_original": "unhas.jpg",
  "tipo_mime": "image/jpeg",
  "servico_id": 1
}
```

**Possíveis respostas de erro:**
- `400`: nenhuma foto ou vídeo selecionado.
- `401`: token não informado ou inválido.
- `403`: usuário sem permissão.
- `404`: serviço não encontrado.
- `500`: erro ao salvar referência.


**Tipo de envio:** `multipart/form-data`.

## 16. Enviar referência de um cliente

**Método:** POST  
**Rota:** `/clientes/:id/referencias`

**Descrição:** Permite que o cliente envie uma foto mostrando como deseja fazer suas unhas.

**Autenticação:** Precisa de token JWT.

**Permissão:** O próprio cliente ou um administrador.


**Parâmetros obrigatórios:**
- `id`: identificação da cliente na URL.
- `arquivo`: foto enviada pelo formulário.

**Formatos permitidos:**
- JPG, PNG e WEBP.

**Tamanho máximo:** 10 MB.

**Tipo de envio:** `multipart/form-data`.

**Nome do campo do arquivo:** `arquivo`.

**Autenticação:**
- Token JWT obrigatório.
- A cliente pode enviar referências para seu próprio cadastro.
- A administradora pode enviar referências para qualquer cliente.

**Exemplo de resposta de sucesso (201):**

```json
{
  "id": 2,
  "nome_original": "unha_rosa.jpg",
  "tipo_mime": "image/jpeg",
  "cliente_id": 1
}
```

**Possíveis respostas de erro:**
- `400`: nenhuma foto selecionada ou arquivo não é uma imagem.
- `401`: token não informado ou inválido.
- `403`: tentativa de enviar referência para outra cliente.
- `404`: cliente não encontrada.
- `500`: erro ao salvar referência da cliente.


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


**Exemplo de resposta de sucesso (200):**

O sistema retorna diretamente a imagem ou o vídeo armazenado no banco de dados.

O cabeçalho `Content-Type` informa o formato do arquivo, como:
- `image/jpeg`
- `image/png`
- `image/webp`
- `video/mp4`
- `video/webm`

**Possíveis respostas de erro:**
- `401`: token não informado ou inválido.
- `403`: usuário sem permissão para visualizar a referência.
- `404`: referência não encontrada.
- `500`: erro ao buscar referência.


## 18. Listar referências de um serviço

**Método:** GET  
**Rota:** `/servicos/:id/referencias`

**Descrição:** Lista as referências cadastradas para determinado serviço.

**Autenticação:** Não precisa.

**Parâmetro:**
- `id`: identificação do serviço.

**Resposta:** Lista com informações das referências disponíveis.


**Exemplo de resposta de sucesso (200):**

```json
[
  {
    "id": 1,
    "nome_original": "unhas.jpg",
    "tipo_mime": "image/jpeg",
    "servico_id": 1
  },
  {
    "id": 2,
    "nome_original": "unhas_video.mp4",
    "tipo_mime": "video/mp4",
    "servico_id": 1
  }
]
```

**Possíveis respostas de erro:**
- `500`: erro ao listar referências do serviço.

**Observação:** Se não houver referências cadastradas, o sistema retorna uma lista vazia (`[]`).


## 19. Visualizar imagem ou vídeo de um serviço

**Método:** GET  
**Rota:** `/servicos/referencias/:id`

**Descrição:** Permite visualizar publicamente uma imagem ou vídeo de um serviço.

**Autenticação:** Não precisa.

**Parâmetro:**
- `id`: identificação da referência.

**Resposta:** Arquivo de imagem ou vídeo.

**Observação:** Essa rota não permite acessar referências particulares dos clientes.


**Exemplo de resposta de sucesso (200):**

O sistema retorna diretamente a imagem ou o vídeo do serviço.

O cabeçalho `Content-Type` informa o formato do arquivo, como:
- `image/jpeg`
- `image/png`
- `image/webp`
- `video/mp4`
- `video/webm`

**Possíveis respostas de erro:**
- `404`: foto ou vídeo do serviço não encontrado.
- `500`: erro ao carregar o arquivo.

## Cancelar agendamento

DELETE /api/agendamentos/:id

Autenticação: token JWT obrigatório.

Permissões:
- Administrador: pode cancelar qualquer agendamento.
- Cliente: pode cancelar apenas seus próprios agendamentos.

Respostas:
- 200: Agendamento cancelado com sucesso.
- 401: Token ausente ou inválido.
- 403: Sem permissão para cancelar.
- 404: Agendamento não encontrado.

O cancelamento exclui o agendamento e seus vínculos com os serviços.

## Validações e tratamento de erros

### Serviços
- O preço deve ser numérico e não pode ser negativo.
- Serviços vinculados a agendamentos ou referências não podem ser excluídos.
- A tentativa de exclusão retorna o status 409.

### Agendamentos
- A data deve estar no formato AAAA-MM-DD.
- O horário deve estar no formato HH:MM.
- Não são permitidas datas inválidas ou agendamentos no passado.

### Upload de arquivos
- O tamanho máximo permitido é de 10 MB.
- São aceitos formatos de imagem e vídeo conforme a rota.
- Arquivos inválidos retornam o status 400 com uma mensagem em JSON.