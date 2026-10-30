# Obra Consciente

Sistema web para controle de materiais e redução de desperdícios na construção civil. Projeto acadêmico desenvolvido com HTML, CSS, JavaScript, Node.js, Express, MySQL, API REST, CRUD e autenticação JWT.

## Problema, público e solução

Em obras, materiais podem ser desperdiçados por falta de controle do estoque, compras excessivas ou dificuldade para acompanhar o consumo. Isso pode aumentar os custos e atrasar a construção. O sistema é destinado a construtoras, engenheiros, mestres de obras, responsáveis pelo estoque e equipes que acompanham materiais. A proposta é cadastrar materiais, registrar entradas e saídas, consultar o estoque e identificar itens abaixo do nível mínimo.

## Funcionalidades

- Cadastro de usuários e login com senha protegida por hash.
- Autenticação JWT com validade de 8 horas.
- Perfis `admin`, `estoquista` e `consulta`, com autorização conferida pela API.
- CRUD de materiais: cadastrar, consultar, editar e excluir (exclusão só para admin e sem histórico de movimentação).
- Registro de entradas e saídas com atualização transacional do estoque.
- Bloqueio de saída acima do estoque disponível.
- Indicador de estoque baixo e histórico das movimentações.
- Interface HTML/CSS/JavaScript que consome a API usando Fetch.

## Perfis de usuário

- **Administrador (`admin`):** consulta, cadastra e edita materiais, exclui materiais sem movimentação e registra entradas/saídas.
- **Responsável pelo estoque (`estoquista`):** consulta, cadastra e edita materiais e registra entradas/saídas.
- **Consulta (`consulta`):** visualiza materiais e histórico, sem alterar os dados.

Por segurança, todo cadastro feito pela tela recebe inicialmente o perfil `consulta`. Quem administra o computador e o banco pode promover uma conta para `estoquista` pelo comando local abaixo. Esse perfil permite cadastrar/editar materiais e registrar movimentações, sem a permissão de exclusão reservada ao administrador.

## Tecnologias

HTML5, CSS3, JavaScript (Fetch e DOM), Node.js, Express, MySQL, mysql2, bcryptjs, jsonwebtoken, dotenv e cors.

## Estrutura

```text
obra-consciente/
├── backend/
│   ├── controllers/       # Regras de autenticação, materiais e movimentações
│   ├── database/          # Pool de conexão MySQL
│   ├── middlewares/       # Autenticação JWT e autorização por perfil
│   ├── routes/            # Rotas da API REST
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/style.css
│   ├── js/app.js
│   └── index.html
├── sql/obra_consciente.sql
├── .gitignore
└── README.md
```

## Como instalar e executar

1. Instale Node.js (versão LTS) e MySQL.
2. Abra o MySQL e configure o banco:
   - Para uma instalação nova, execute `sql/obra_consciente.sql`.
   - Se já criou o banco com a versão anterior do projeto, faça um backup e execute `sql/migrar_schema_atual.sql` uma única vez para adaptar as tabelas sem apagar os registros existentes. Essa migração remove e recria as validações de quantidade porque o MySQL não permite renomear colunas usadas por essas validações.
3. No terminal, entre na pasta `backend` e instale as dependências:

   ```bash
   npm install
   ```

4. Copie `backend/.env.example` para `backend/.env`, configure usuário/senha do MySQL e substitua `JWT_SECRET` por uma chave aleatória longa. Para gerar uma chave localmente, use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` e copie o resultado para o `.env`. Não envie `.env` ao GitHub.
5. Inicie a API dentro da pasta `backend`:

   ```bash
   npm run dev
   ```

6. Abra `frontend/index.html` no navegador. A API fica em `http://localhost:3000`.
7. Crie uma conta na tela. Para habilitar cadastro de materiais e movimentações para ela, abra outro terminal na pasta `backend` e execute, trocando o e-mail pelo da conta:

   ```bash
   npm run promover-estoquista -- seu-email@exemplo.com
   ```

   Saia da conta no site e entre novamente para receber um token com o novo perfil. Novas contas continuam começando como `consulta`. O comando é local e não existe uma opção pública no site para elevar privilégios.

## Rotas principais da API

Todas as respostas são JSON. Para rotas protegidas, envie `Authorization: Bearer SEU_TOKEN`.

| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/` | Público | Verificar se a API iniciou |
| GET | `/api/saude` | Público | Verificar conexão com MySQL |
| POST | `/api/auth/cadastro` | Público | Cadastrar conta com perfil consulta |
| POST | `/api/auth/login` | Público | Entrar e receber JWT |
| GET | `/api/perfil` | Autenticado | Consultar dados do token |
| GET | `/api/materiais` | Autenticado | Listar materiais |
| POST | `/api/materiais` | Admin/estoquista | Cadastrar material |
| PUT | `/api/materiais/:id` | Admin/estoquista | Editar material |
| DELETE | `/api/materiais/:id` | Admin | Excluir material sem movimentações |
| GET | `/api/movimentacoes` | Autenticado | Listar histórico recente |
| POST | `/api/movimentacoes` | Admin/estoquista | Registrar entrada ou saída |

## Modelo de dados

- `usuarios`: dados de acesso e perfil.
- `materiais`: informações e saldo atual dos materiais; pode apontar para o usuário que cadastrou.
- `movimentacoes`: registra tipo, quantidade, material, usuário e data; possui chaves estrangeiras para `materiais` e `usuarios`.

## Regras de negócio

- Quantidades de materiais e estoque mínimo não podem ser negativos.
- A quantidade de uma movimentação precisa ser maior que zero.
- Não é permitida saída maior que o saldo disponível.
- O saldo e o registro de movimentação são atualizados na mesma transação.
- O sistema sinaliza estoque baixo quando quantidade disponível é menor ou igual ao estoque mínimo.
- A API verifica permissões; ocultar botões no navegador não é considerado controle de acesso suficiente.
- Materiais com movimentações não podem ser excluídos, para preservar o histórico.

## Testes manuais

1. Abra `/api/saude` e confira se o banco está conectado.
2. Cadastre uma conta, promova-a a `admin` pelo SQL e entre novamente.
3. Cadastre um material com quantidade inicial de 10 e estoque mínimo de 3.
4. Registre uma saída de 4 e confira se o saldo fica 6.
5. Tente registrar uma saída de 7: a API deve recusar por estoque insuficiente.
6. Cadastre outro usuário e confirme que o perfil consulta não consegue cadastrar, editar ou movimentar estoque.
7. Confira o histórico e o aviso de estoque baixo.

## GitHub e entregas

Use o mesmo repositório nas quatro etapas. Faça commits pequenos e coerentes, por exemplo:

- `Entrega 1: documenta problema e estrutura inicial`
- `Entrega 2: implementa banco e autenticação JWT`
- `Entrega 3: implementa CRUD e integração da API`
- `Entrega 4: finaliza regras, testes e documentação`

Antes de publicar, confira se `.env`, senhas, tokens e `node_modules` não foram adicionados. Este repositório contém a implementação-base das quatro etapas; execute os testes no seu computador e esteja preparada para explicar o código na apresentação.
