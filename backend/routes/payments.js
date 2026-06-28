const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, ctrl.createPaymentIntent);
router.post('/webhook', ctrl.webhook);

module.exports = router;
