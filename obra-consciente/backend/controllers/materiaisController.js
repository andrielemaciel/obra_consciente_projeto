const db = require('../database/conexao');

async function listar(req, res) {
  try {
    const [rows] = await db.execute('SELECT * FROM materiais ORDER BY nome');
    res.json(rows);
  } catch (erro) { console.error(erro); res.status(500).json({ erro: 'Erro ao consultar materiais. Verifique se o banco foi atualizado com sql/migrar_schema_atual.sql.' }); }
}
async function criar(req, res) {
  try {
    const { nome, categoria, unidade, quantidade, estoque_minimo, descricao } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() || typeof unidade !== 'string' || !unidade || quantidade === undefined || estoque_minimo === undefined) return res.status(400).json({ erro: 'Preencha nome, unidade, quantidade e estoque mínimo.' });
    if (!Number.isFinite(Number(quantidade)) || Number(quantidade) < 0 || !Number.isFinite(Number(estoque_minimo)) || Number(estoque_minimo) < 0) return res.status(400).json({ erro: 'As quantidades não podem ser negativas.' });
    const [result] = await db.execute('INSERT INTO materiais (nome, categoria, unidade, quantidade, estoque_minimo, descricao, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?)', [nome.trim(), categoria || 'Outros', unidade, Number(quantidade), Number(estoque_minimo), descricao || '', req.usuario.id]);
    const [rows] = await db.execute('SELECT * FROM materiais WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (erro) { console.error(erro); res.status(500).json({ erro: 'Erro ao cadastrar material.' }); }
}
async function atualizar(req, res) {
  try {
    const { nome, categoria, unidade, estoque_minimo, descricao } = req.body || {};
    if (typeof nome !== 'string' || !nome.trim() || typeof unidade !== 'string' || !unidade || estoque_minimo === undefined || !Number.isFinite(Number(estoque_minimo)) || Number(estoque_minimo) < 0) return res.status(400).json({ erro: 'Preencha nome, unidade e estoque mínimo válido.' });
    const [result] = await db.execute('UPDATE materiais SET nome=?, categoria=?, unidade=?, estoque_minimo=?, descricao=? WHERE id=?', [nome.trim(), categoria || 'Outros', unidade, Number(estoque_minimo), descricao || '', req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Material não encontrado.' });
    const [rows] = await db.execute('SELECT * FROM materiais WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (erro) { console.error(erro); res.status(500).json({ erro: 'Erro ao atualizar material.' }); }
}
async function excluir(req, res) {
  try {
    const [movs] = await db.execute('SELECT id FROM movimentacoes WHERE material_id = ? LIMIT 1', [req.params.id]);
    if (movs.length) return res.status(409).json({ erro: 'Este material tem histórico. Mantenha o registro para preservar as movimentações.' });
    const [result] = await db.execute('DELETE FROM materiais WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Material não encontrado.' });
    res.json({ mensagem: 'Material excluído.' });
  } catch (erro) { console.error(erro); res.status(500).json({ erro: 'Erro ao excluir material.' }); }
}
module.exports = { listar, criar, atualizar, excluir };
