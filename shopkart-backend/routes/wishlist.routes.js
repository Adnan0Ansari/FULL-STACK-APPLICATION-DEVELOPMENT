const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } = require('../controllers/wishlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/:productId', authMiddleware, addToWishlist);
router.get('/', authMiddleware, getWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);
router.patch('/:productId/toggle', authMiddleware, toggleWishlist);

module.exports = router;