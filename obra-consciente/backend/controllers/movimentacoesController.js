const db = require('../database/conexao');

const LIMITE_DECIMAL = 9999999999.99;

function idValido(valor) {
  return /^\d+$/.test(String(valor)) && Number(valor) > 0 && Number.isSafeInteger(Number(valor));
}

async function listar(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT m.id, m.material_id, ma.nome AS material, m.tipo, m.quantidade,
             m.observacao, m.criado_em, u.nome AS usuario
      FROM movimentacoes m
      JOIN materiais ma ON ma.id = m.material_id
      LEFT JOIN usuarios u ON u.id = m.usuario_id
      ORDER BY m.criado_em DESC
      LIMIT 200
    `);
    return res.json(rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao consultar movimentações.' });
  }
}

async function criar(req, res) {
  const { material_id, tipo, quantidade, observacao } = req.body || {};
  const qtd = Number(quantidade);

  if (!idValido(material_id)) {
    return res.status(400).json({ erro: 'Informe um material válido.' });
  }
  if (!['entrada', 'saida'].includes(tipo)) {
    return res.status(400).json({ erro: 'O tipo deve ser entrada ou saída.' });
  }
  if (quantidade === undefined || quantidade === null || quantidade === '' ||
      !Number.isFinite(qtd) || qtd <= 0 || qtd > LIMITE_DECIMAL) {
    return res.status(400).json({ erro: 'A quantidade deve ser maior que zero e válida.' });
  }
  if (observacao !== undefined && observacao !== null &&
      (typeof observacao !== 'string' || observacao.length > 255)) {
    return res.status(400).json({ erro: 'A observação deve ter até 255 caracteres.' });
  }
  if (!req.usuario || !idValido(req.usuario.id)) {
    return res.status(401).json({ erro: 'Usuário não autenticado corretamente.' });
  }

  let conexao;
  let transacaoIniciada = false;
  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();
    transacaoIniciada = true;

    const [materiais] = await conexao.execute(
      'SELECT id, quantidade FROM materiais WHERE id = ? FOR UPDATE',
      [Number(material_id)]
    );

    if (!materiais.length) {
      await conexao.rollback();
      transacaoIniciada = false;
      return res.status(404).json({ erro: 'Material não encontrado.' });
    }

    const atual = Number(materiais[0].quantidade);
    if (!Number.isFinite(atual) || atual < 0) {
      throw new Error('O saldo atual do material é inválido.');
    }
    if (tipo === 'saida' && qtd > atual) {
      await conexao.rollback();
      transacaoIniciada = false;
      return res.status(400).json({ erro: 'Estoque insuficiente para registrar essa saída.' });
    }

    const novoEstoque = tipo === 'entrada' ? atual + qtd : atual - qtd;
    if (!Number.isFinite(novoEstoque) || novoEstoque > LIMITE_DECIMAL) {
      await conexao.rollback();
      transacaoIniciada = false;
      return res.status(400).json({ erro: 'O estoque final ultrapassa o limite permitido.' });
    }

    await conexao.execute('UPDATE materiais SET quantidade = ? WHERE id = ?', [novoEstoque, Number(material_id)]);
    await conexao.execute(
      `INSERT INTO movimentacoes (material_id, usuario_id, tipo, quantidade, observacao)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(material_id), req.usuario.id, tipo, qtd, observacao?.trim() || '']
    );

    await conexao.commit();
    transacaoIniciada = false;
    return res.status(201).json({
      mensagem: 'Movimentação registrada com sucesso.',
      quantidade_atual: novoEstoque
    });
  } catch (erro) {
    console.error(erro);
    if (conexao && transacaoIniciada) {
      try { await conexao.rollback(); } catch (erroRollback) { console.error(erroRollback); }
    }
    return res.status(500).json({ erro: 'Erro ao registrar movimentação.' });
  } finally {
    conexao?.release();
  }
}

module.exports = { listar, criar };
