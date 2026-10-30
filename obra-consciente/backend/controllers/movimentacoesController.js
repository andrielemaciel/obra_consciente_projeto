const db = require('../database/conexao');

async function listar(req, res) {
  try {
    const [rows] = await db.execute(`SELECT m.id, m.material_id, ma.nome AS material, m.tipo, m.quantidade, m.observacao, m.criado_em, u.nome AS usuario
      FROM movimentacoes m JOIN materiais ma ON ma.id=m.material_id LEFT JOIN usuarios u ON u.id=m.usuario_id ORDER BY m.criado_em DESC LIMIT 200`);
    res.json(rows);
  } catch (erro) { console.error(erro); res.status(500).json({ erro: 'Erro ao consultar movimentações. Verifique se o banco foi atualizado com sql/migrar_schema_atual.sql.' }); }
}
async function criar(req, res) {
  const { material_id, tipo, quantidade, observacao } = req.body || {};
  const qtd = Number(quantidade);
  if (!material_id || !['entrada', 'saida'].includes(tipo) || !Number.isFinite(qtd) || qtd <= 0) return res.status(400).json({ erro: 'Informe material, tipo e quantidade maior que zero.' });
  let conexao;
  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();
    const [materiais] = await conexao.execute('SELECT id, quantidade, nome FROM materiais WHERE id=? FOR UPDATE', [material_id]);
    if (!materiais.length) { await conexao.rollback(); return res.status(404).json({ erro: 'Material não encontrado.' }); }
    const atual = Number(materiais[0].quantidade);
    if (tipo === 'saida' && qtd > atual) { await conexao.rollback(); return res.status(400).json({ erro: 'Estoque insuficiente para registrar essa saída.' }); }
    const novo = tipo === 'entrada' ? atual + qtd : atual - qtd;
    await conexao.execute('UPDATE materiais SET quantidade=? WHERE id=?', [novo, material_id]);
    await conexao.execute('INSERT INTO movimentacoes (material_id, usuario_id, tipo, quantidade, observacao) VALUES (?, ?, ?, ?, ?)', [material_id, req.usuario.id, tipo, qtd, observacao || '']);
    await conexao.commit();
    res.status(201).json({ mensagem: 'Movimentação registrada.', quantidade_atual: novo });
  } catch (erro) {
    console.error(erro);
    if (conexao) {
      try {
        await conexao.rollback();
      } catch (erroRollback) {
        console.error(erroRollback);
      }
    }
    return res.status(500).json({ erro: 'Erro ao registrar movimentação.' });
  } finally {
    conexao?.release();
  }
}
module.exports = { listar, criar };
