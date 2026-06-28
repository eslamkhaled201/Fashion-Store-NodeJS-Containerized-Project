const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/dashboard', ctrl.getDashboard);
router.get('/orders', ctrl.getAllOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);
router.get('/users', ctrl.getAllUsers);
router.post('/users', ctrl.createUser);
router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;
