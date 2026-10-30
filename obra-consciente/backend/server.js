require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/conexao');
const authRoutes = require('./routes/authRoutes');
const materiaisRoutes = require('./routes/materiaisRoutes');
const movimentacoesRoutes = require('./routes/movimentacoesRoutes');
const autenticar = require('./middlewares/autenticacaoMiddleware');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.json({ mensagem: 'API Obra Consciente está funcionando!' }));
app.get('/api/saude', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await db.query('SELECT quantidade, estoque_minimo FROM materiais LIMIT 0');
    await db.query('SELECT criado_em FROM movimentacoes LIMIT 0');
    res.json({ api: 'ok', banco: 'conectado', schema: 'atualizado' });
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(503).json({
        api: 'ok',
        banco: 'conectado',
        schema: 'desatualizado',
        erro: 'O banco ainda usa o esquema antigo. Faça backup e execute sql/migrar_schema_atual.sql.'
      });
    }
    res.status(503).json({ api: 'ok', banco: 'indisponível', erro: 'Verifique a configuração do MySQL.' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/materiais', materiaisRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.get('/api/perfil', autenticar, (req, res) => res.json({ usuario: req.usuario }));
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((erro, req, res, next) => { console.error(erro); res.status(500).json({ erro: 'Erro interno do servidor.' }); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Obra Consciente rodando em http://localhost:${PORT}`));
