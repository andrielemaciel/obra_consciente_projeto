const db = require('../database/conexao');

async function promoverEstoquista() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Informe um e-mail válido: npm run promover-estoquista -- seu-email@exemplo.com');
  }

  const [usuarios] = await db.execute(
    'SELECT id, perfil FROM usuarios WHERE email = ?',
    [email]
  );
  if (!usuarios.length) {
    throw new Error('Não encontrei uma conta com esse e-mail. Cadastre-se no site primeiro.');
  }

  const usuario = usuarios[0];
  if (usuario.perfil === 'admin' || usuario.perfil === 'estoquista') {
    console.log('Esta conta já pode cadastrar materiais e registrar movimentações.');
    return;
  }
  if (usuario.perfil !== 'consulta') {
    throw new Error('O perfil atual não pode ser promovido automaticamente.');
  }

  await db.execute(
    "UPDATE usuarios SET perfil = 'estoquista' WHERE id = ? AND perfil = 'consulta'",
    [usuario.id]
  );
  console.log('Perfil atualizado para Responsável pelo estoque.');
  console.log('Saia da conta no site e entre novamente para liberar os recursos.');
}

promoverEstoquista()
  .catch((erro) => {
    console.error(erro.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
