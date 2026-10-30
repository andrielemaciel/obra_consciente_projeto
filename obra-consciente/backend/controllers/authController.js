const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/conexao');

async function cadastrar(req, res) {
  try {
    const { nome, email, senha } = req.body || {};
    if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string' ||
        !nome.trim() || !email.trim() || senha.length < 6) {
      return res.status(400).json({ erro: 'Informe nome, e-mail e senha com pelo menos 6 caracteres.' });
    }
    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim().toLowerCase();
    if (nomeNormalizado.length > 120 || emailNormalizado.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      return res.status(400).json({ erro: 'Informe um nome e um e-mail válidos.' });
    }
    const [existente] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [emailNormalizado]);
    if (existente.length) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    const hash = await bcrypt.hash(senha, 10);
    // Cadastro público sempre cria perfil de consulta; perfis elevados são definidos pelo administrador no banco.
    const [resultado] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      [nomeNormalizado, emailNormalizado, hash, 'consulta']
    );
    return res.status(201).json({ mensagem: 'Cadastro realizado. Agora você pode entrar.', id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({ erro: 'O MySQL recusou a conexão. Confira o usuário e a senha configurados no backend.' });
    }
    return res.status(500).json({ erro: 'Não foi possível realizar o cadastro.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ erro: 'O login está indisponível: configure JWT_SECRET no arquivo backend/.env e reinicie a API.' });
    }
    const [rows] = await db.execute('SELECT id, nome, email, senha_hash, perfil FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(senha, rows[0].senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }
    const usuario = rows[0];
    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } });
  } catch (erro) {
    console.error(erro);
    if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({ erro: 'O MySQL recusou a conexão. Confira o usuário e a senha configurados no backend.' });
    }
    return res.status(500).json({ erro: 'Não foi possível entrar no sistema.' });
  }
}
module.exports = { cadastrar, login };
