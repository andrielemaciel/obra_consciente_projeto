const router = require('express').Router();
const { cadastrar, login } = require('../controllers/authController');
router.post('/cadastro', cadastrar);
router.post('/login', login);
module.exports = router;
