const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders,
  getOrderById,
} = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.post('/payment-failed', markPaymentFailed);
router.get('/', getOrders);
router.get('/:id', getOrderById);

module.exports = router;