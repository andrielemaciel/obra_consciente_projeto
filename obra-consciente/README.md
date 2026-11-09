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
