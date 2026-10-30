const router = require('express').Router();
const c = require('../controllers/movimentacoesController');
const autenticar = require('../middlewares/autenticacaoMiddleware');
const permitir = require('../middlewares/autorizacaoMiddleware');
router.use(autenticar);
router.get('/', c.listar);
router.post('/', permitir('admin', 'estoquista'), c.criar);
module.exports = router;
