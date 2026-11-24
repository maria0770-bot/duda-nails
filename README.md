
# 💅 Duda Nails

## Sobre o projeto

O Duda Nails é um sistema de agendamento de serviços de unhas, desenvolvido como trabalho prático da disciplina de Backend.

O sistema permite cadastrar clientes, consultar serviços, realizar agendamentos e enviar fotos ou vídeos de referência.

## Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- Docker e Docker Compose
- JWT para autenticação
- Multer para upload de arquivos

## Como executar o projeto

### 1. Requisitos

É necessário ter o Docker Desktop instalado e funcionando.

### 2. Configurar as variáveis de ambiente

Na pasta principal do projeto, crie um arquivo chamado `.env`, utilizando o `.env.example` como modelo.

Configure as variáveis:

- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_PORT`
- `PGWEB_PORT`
- `JWT_SECRET`

A variável `JWT_SECRET` deve conter uma chave secreta forte.

**Importante:** Não publique o arquivo `.env` no GitHub.

### 3. Iniciar o sistema

Abra o terminal na pasta principal do projeto e execute:

```bash
docker compose up -d --build
```

Na primeira execução, o Docker criará o banco de dados e executará o arquivo `init.sql`.

### 4. Acessar o sistema

API:

http://localhost:3000/api

Lista de serviços:

http://localhost:3000/api/servicos

Gerenciador do banco de dados (Pgweb):

http://localhost:8081

### 5. Parar o sistema

```bash
docker compose down
```

Esse comando encerra os containers sem apagar os dados armazenados no volume do banco.

## Autenticação

O sistema utiliza JWT para proteger rotas.

Para acessar as rotas protegidas, é necessário realizar login e enviar o token no cabeçalho:

`Authorization: Bearer SEU_TOKEN`

Existem dois tipos de usuários:

- **Cliente:** pode consultar serviços, acessar seus dados e realizar agendamentos.
- **Administrador:** pode gerenciar serviços e clientes e visualizar os agendamentos.

## Banco de dados

O banco PostgreSQL utiliza tabelas para armazenar:

- Usuários
- Clientes
- Serviços
- Agendamentos
- Serviços vinculados aos agendamentos
- Referências de imagens e vídeos

O relacionamento entre agendamentos e serviços é do tipo N:N (muitos para muitos).

## Documentação das rotas

Todas as rotas da API estão descritas no arquivo [rotas.md](rotas.md).

## Observações

O projeto foi desenvolvido para fins acadêmicos e utiliza configurações locais de desenvolvimento.

## Criar administrador

Depois de iniciar o projeto com Docker, execute:

docker compose exec -it node node scripts/criar-admin.js

O programa solicitará nome, e-mail e senha.

A senha será criptografada com bcrypt.

Após criar o administrador, utilize a rota POST /api/login para entrar e obter o token JWT.
