const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todas as rotas de tickets requerem autenticação
router.use(authMiddleware);

router.get('/', ticketController.listarTickets);
router.post('/', ticketController.criarTicket);
router.get('/:id', ticketController.obterTicket);

// Rotas restritas exclusivamente a Administradores
router.patch('/:id/status', adminMiddleware, ticketController.atualizarStatusTicket);
router.delete('/:id', adminMiddleware, ticketController.deletarTicket);

module.exports = router;
