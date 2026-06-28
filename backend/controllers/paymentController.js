const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../config/db');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { order_id } = req.body;
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, req.user.id]);
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });

    const order = orders[0];
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(order.total) * 100),
      currency: 'usd',
      metadata: { order_id: order.id.toString(), order_number: order.order_number },
    });

    await pool.query('UPDATE orders SET payment_intent_id = ? WHERE id = ?', [intent.id, order_id]);
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    await pool.query(
      "UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE payment_intent_id = ?",
      [intent.id]
    );
  } else if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await pool.query(
      "UPDATE orders SET payment_status = 'failed' WHERE payment_intent_id = ?",
      [intent.id]
    );
  }
  res.json({ received: true });
};
