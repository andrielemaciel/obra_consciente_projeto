const db = require('../database/conexao');

const LIMITE_DECIMAL = 9999999999.99;

function idValido(valor) {
  return /^\d+$/.test(String(valor)) && Number(valor) > 0 && Number.isSafeInteger(Number(valor));
}

function numeroValido(valor) {
  if (valor === undefined || valor === null || valor === '') return false;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 && numero <= LIMITE_DECIMAL;
}

function textoValido(valor, limite, obrigatorio = false) {
  if (typeof valor !== 'string') return !obrigatorio && (valor === undefined || valor === null);
  const texto = valor.trim();
  return (!obrigatorio || texto.length > 0) && texto.length <= limite;
}

async function listar(req, res) {
  try {
    const [rows] = await db.execute('SELECT * FROM materiais ORDER BY nome');
    return res.json(rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao consultar materiais.' });
  }
}

async function criar(req, res) {
  try {
    const { nome, categoria, unidade, quantidade, estoque_minimo, descricao } = req.body || {};

    if (!textoValido(nome, 140, true) || !textoValido(unidade, 20, true)) {
      return res.status(400).json({ erro: 'Informe nome e unidade válidos.' });
    }
    if (categoria !== undefined && !textoValido(categoria, 80)) {
      return res.status(400).json({ erro: 'A categoria deve ter até 80 caracteres.' });
    }
    if (descricao !== undefined && !textoValido(descricao, 5000)) {
      return res.status(400).json({ erro: 'A descrição deve ter até 5.000 caracteres.' });
    }
    if (!numeroValido(quantidade) || !numeroValido(estoque_minimo)) {
      return res.status(400).json({ erro: 'Quantidade e estoque mínimo devem ser números válidos e não negativos.' });
    }
    if (!req.usuario || !idValido(req.usuario.id)) {
      return res.status(401).json({ erro: 'Usuário não autenticado corretamente.' });
    }

    const [resultado] = await db.execute(
      `INSERT INTO materiais
      (nome, categoria, unidade, quantidade, estoque_minimo, descricao, criado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome.trim(), categoria?.trim() || 'Outros', unidade.trim(), Number(quantidade), Number(estoque_minimo), descricao?.trim() || '', req.usuario.id]
    );

    const [rows] = await db.execute('SELECT * FROM materiais WHERE id = ?', [resultado.insertId]);
    return res.status(201).json(rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar material.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = req.params.id;
    const { nome, categoria, unidade, estoque_minimo, descricao } = req.body || {};

    if (!idValido(id)) {
      return res.status(400).json({ erro: 'ID do material inválido.' });
    }
    if (!textoValido(nome, 140, true) || !textoValido(unidade, 20, true)) {
      return res.status(400).json({ erro: 'Informe nome e unidade válidos.' });
    }
    if (categoria !== undefined && !textoValido(categoria, 80)) {
      return res.status(400).json({ erro: 'A categoria deve ter até 80 caracteres.' });
    }
    if (descricao !== undefined && !textoValido(descricao, 5000)) {
      return res.status(400).json({ erro: 'A descrição deve ter até 5.000 caracteres.' });
    }
    if (!numeroValido(estoque_minimo)) {
      return res.status(400).json({ erro: 'O estoque mínimo deve ser válido e não negativo.' });
    }

    const [existente] = await db.execute('SELECT id FROM materiais WHERE id = ?', [Number(id)]);
    if (!existente.length) {
      return res.status(404).json({ erro: 'Material não encontrado.' });
    }

    await db.execute(
      `UPDATE materiais SET nome = ?, categoria = ?, unidade = ?, estoque_minimo = ?, descricao = ? WHERE id = ?`,
      [nome.trim(), categoria?.trim() || 'Outros', unidade.trim(), Number(estoque_minimo), descricao?.trim() || '', Number(id)]
    );

    const [rows] = await db.execute('SELECT * FROM materiais WHERE id = ?', [Number(id)]);
    return res.json(rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar material.' });
  }
}

async function excluir(req, res) {
  try {
    const id = req.params.id;
    if (!idValido(id)) {
      return res.status(400).json({ erro: 'ID do material inválido.' });
    }

    const [existente] = await db.execute('SELECT id FROM materiais WHERE id = ?', [Number(id)]);
    if (!existente.length) {
      return res.status(404).json({ erro: 'Material não encontrado.' });
    }

    const [movimentacoes] = await db.execute(
      'SELECT id FROM movimentacoes WHERE material_id = ? LIMIT 1',
      [Number(id)]
    );
    if (movimentacoes.length) {
      return res.status(409).json({ erro: 'Este material possui movimentações e não pode ser excluído.' });
    }

    await db.execute('DELETE FROM materiais WHERE id = ?', [Number(id)]);
    return res.json({ mensagem: 'Material excluído com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir material.' });
  }
}

module.exports = { listar, criar, atualizar, excluir };
