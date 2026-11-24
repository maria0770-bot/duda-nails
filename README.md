
# 💅 Duda Nails

## Sobre o projeto

O Duda Nails é um sistema de agendamento de serviços de unhas, desenvolvido como trabalho prático da disciplina de Backend.

O sistema possui uma API REST, banco de dados PostgreSQL e uma interface desenvolvida em React, com funcionalidades para clientes e administradores.

## Tecnologias utilizadas

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- Bcrypt
- Multer

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Ambiente de desenvolvimento

- Docker
- Docker Compose
- Git e GitHub

## Funcionalidades

### Área pública

- Visualização dos serviços disponíveis.
- Consulta dos preços.
- Galeria de fotos e vídeos.
- Cadastro de novos usuários.
- Login.

### Área do cliente

- Visualização dos serviços.
- Agendamento de um ou mais serviços.
- Visualização do valor total dos serviços selecionados.
- Consulta dos próprios agendamentos.
- Cancelamento de agendamentos.
- Envio de fotos de referência.
- Visualização das próprias referências.
- Logout.

### Área do administrador

- Cadastro, consulta, edição e exclusão de clientes.
- Cadastro, consulta, edição e exclusão de serviços.
- Visualização dos agendamentos.
- Cancelamento de agendamentos.
- Envio e exclusão de fotos e vídeos dos serviços.
- Visualização das referências enviadas pelas clientes.
- Logout.

## Como executar o projeto

### 1. Requisitos

É necessário ter o Docker Desktop instalado e funcionando.

### 2. Clonar o repositório

```bash
git clone https://github.com/maria0770-bot/duda-nails.git
cd duda-nails
```

### 3. Configurar as variáveis de ambiente

Na pasta principal do projeto, crie um arquivo chamado `.env`, utilizando o `.env.example` como modelo.

Configure as variáveis:

- PORT
- DB_HOST
- DB_USER
- DB_PASS
- DB_NAME
- DB_PORT
- PGWEB_PORT
- JWT_SECRET

A variável JWT_SECRET deve conter uma chave secreta forte e exclusiva.

No PowerShell, é possível gerar uma chave utilizando:

```powershell
docker run --rm node:22-alpine node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie a chave gerada para a variável JWT_SECRET no arquivo `.env`.

**Importante:** não publique o arquivo `.env` no GitHub.

### 4. Iniciar o backend

Na pasta principal do projeto, execute:

```bash
docker compose up -d --build
```

Na primeira execução, o Docker criará o banco de dados e executará o arquivo `init.sql`.

### 5. Iniciar o frontend

Na pasta principal do projeto, utilizando o PowerShell, execute:

```powershell
docker run -d --name duda-frontend -p 5173:5173 -v "${PWD}:/projeto" -w /projeto/frontend node:22-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

Aguarde a instalação das dependências e a inicialização do frontend.

Caso o container já tenha sido criado anteriormente, utilize:

```bash
docker start duda-frontend
```

### 6. Acessar o sistema

Frontend:

http://localhost:5173

API:

http://localhost:3000/api

Lista de serviços:

http://localhost:3000/api/servicos

Gerenciador do banco de dados (Pgweb):

http://localhost:8081

## Criar administrador

Depois de iniciar o backend, execute:

```bash
docker compose exec -it node node scripts/criar-admin.js
```

O programa solicitará:

- Nome.
- E-mail.
- Senha.

A senha será armazenada utilizando hash com bcrypt.

Após criar o administrador, acesse o frontend e realize o login com os dados cadastrados.

Os clientes podem criar suas contas diretamente pelo site.

## Autenticação e segurança

O sistema utiliza JWT para autenticação e proteção das rotas privadas.

Para acessar uma rota protegida da API, é necessário enviar o token no cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

Existem dois tipos de usuários:

- Cliente.
- Administrador.

Cada usuário possui permissões de acordo com seu tipo de conta.

O token possui duração de uma hora. Quando uma requisição protegida identifica que a sessão expirou, o frontend desconecta o usuário e apresenta uma mensagem solicitando um novo login.

As senhas são protegidas utilizando bcrypt.

## Banco de dados

O banco PostgreSQL possui as seguintes tabelas:

- usuarios
- clientes
- servicos
- agendamentos
- agendamento_servicos
- referencias

### Relacionamento 1:N

Um cliente pode possuir vários agendamentos.

Cada agendamento pertence a um cliente.

### Relacionamento N:N

Um agendamento pode possuir vários serviços.

Um serviço pode estar presente em vários agendamentos.

Esse relacionamento utiliza a tabela agendamento_servicos.

## Upload de arquivos

O sistema utiliza Multer para receber arquivos.

Formatos permitidos para referências dos serviços:

- JPEG
- PNG
- WEBP
- MP4
- WEBM

O tamanho máximo permitido é de 10 MB por arquivo.

Os arquivos são armazenados no banco de dados PostgreSQL.

As referências dos serviços podem ser visualizadas na galeria pública.

As fotos enviadas pelas clientes são privadas e podem ser acessadas pela própria cliente e pelo administrador.

## Validações

O sistema possui validações para:

- Campos obrigatórios.
- Preços negativos.
- Datas e horários de agendamento no passado.
- Formatos e tamanhos dos arquivos.
- Permissões dos usuários.
- Tokens inválidos ou expirados.
- Exclusão de registros com vínculos que impedem sua remoção.

## Interface

A interface foi desenvolvida em React e estilizada com CSS.

O projeto utiliza uma identidade visual em tons de bege e rosé, com adaptação para computadores e celulares.

O frontend consome os dados da API REST.

## Documentação das rotas

A documentação da API está disponível no arquivo [rotas.md](rotas.md).

## Parar o sistema

Para parar o frontend:

```bash
docker stop duda-frontend
```

Para parar o backend e o banco de dados:

```bash
docker compose down
```

Esses comandos não apagam os dados armazenados no volume do banco.

## Observações

O Duda Nails foi desenvolvido para fins acadêmicos, utilizando configurações locais de desenvolvimento.
