# Obra Consciente

Sistema web desenvolvido para ajudar no controle de materiais e na redução de desperdícios na construção civil.

## 1. Problema, público e solução

Em muitas obras, materiais podem ser desperdiçados por falta de controle do estoque, compras excessivas ou dificuldade para acompanhar o consumo. Isso pode aumentar os custos e causar atrasos na construção.

O sistema Obra Consciente foi pensado para construtoras, engenheiros, mestres de obras, responsáveis pelo estoque e equipes que precisam acompanhar os materiais utilizados nas construções.

A proposta é desenvolver um sistema web que permita cadastrar materiais, registrar entradas e saídas, consultar as quantidades disponíveis e identificar materiais que estejam abaixo do estoque mínimo. Assim, será possível melhorar a organização dos materiais e evitar desperdícios.

## 2. Principais funcionalidades

- Cadastro e login de usuários.
- Controle de acesso conforme o perfil do usuário.
- Cadastro de materiais.
- Consulta dos materiais disponíveis.
- Edição e exclusão de materiais.
- Registro de entradas e saídas de materiais.
- Atualização automática das quantidades em estoque.
- Avisos quando os materiais estiverem abaixo do estoque mínimo.
- Histórico de movimentações.

## 3. Tipos de usuários e suas permissões

O sistema terá três tipos de usuários:

**Administrador (admin):**
- Visualizar os materiais.
- Cadastrar e editar materiais.
- Excluir materiais sem movimentações registradas.
- Registrar entradas e saídas.
- Consultar o histórico de movimentações.

**Responsável pelo estoque (estoquista):**
- Visualizar os materiais.
- Cadastrar e editar materiais.
- Registrar entradas e saídas.
- Consultar o histórico de movimentações.

**Usuário de consulta (consulta):**
- Visualizar os materiais cadastrados.
- Consultar o histórico de movimentações.
- Não pode alterar informações ou registrar movimentações.

## 4. Fluxo básico de funcionamento

1. O usuário acessa o sistema Obra Consciente.
2. Realiza o cadastro ou faz login com seu e-mail e senha.
3. O sistema verifica os dados e identifica o perfil de acesso do usuário.
4. Após entrar, o usuário pode visualizar os materiais cadastrados no estoque.
5. O administrador e o responsável pelo estoque podem cadastrar materiais, editar informações e registrar entradas e saídas.
6. A cada movimentação, o sistema atualiza automaticamente a quantidade disponível.
7. Quando um material atinge ou fica abaixo do estoque mínimo, o sistema apresenta um alerta.
8. Os usuários também podem consultar o histórico de movimentações para acompanhar o controle dos materiais.

## 5. Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MySQL
- API REST
- JWT para autenticação
- Fetch para comunicação entre o front-end e o back-end.

## 6. Estrutura do projeto

```text
obra-consciente/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── sql/
│   ├── obra_consciente.sql
│   └── migrar_schema_atual.sql
├── .gitignore
└── README.md
```

## 7. Banco de dados

O sistema utilizará o MySQL para armazenar as informações.

As principais tabelas previstas são:

- **usuarios:** armazena os dados dos usuários e seus níveis de acesso.
- **materiais:** armazena os dados dos materiais, suas quantidades e o estoque mínimo.
- **movimentacoes:** registra as entradas e saídas de materiais, incluindo a quantidade, a data e o usuário responsável.

As tabelas serão relacionadas por meio de chaves primárias e estrangeiras.

## 8. Organização do desenvolvimento

O projeto será desenvolvido em etapas, utilizando o mesmo repositório no GitHub durante todo o processo.

- **Entrega 1:** definição do problema, proposta de solução e estrutura inicial do projeto.
- **Entrega 2:** desenvolvimento do banco de dados, cadastro, login e autenticação com JWT.
- **Entrega 3:** implementação do CRUD, integração entre front-end, API e banco de dados.
- **Entrega 4:** finalização do sistema, testes, documentação e apresentação.

## 9. GitHub

O GitHub será utilizado para armazenar e organizar os arquivos do projeto, registrar as alterações realizadas por meio de commits e acompanhar a evolução do desenvolvimento.