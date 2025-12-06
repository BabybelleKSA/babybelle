const Stripe = require('stripe');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? Stripe(stripeSecret) : null;

const resolveOrigin = (req) => {
  if (req.headers.origin) return req.headers.origin;
  if (req.headers.referer) {
    try {
      const url = new URL(req.headers.referer);
      return url.origin;
    } catch {
      // Ignore parse errors and fallback
    }
  }
  return 'http://localhost:3000';
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured. Missing STRIPE_SECRET_KEY.' });
  }

  try {
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const { cart } = JSON.parse(bodyString || '{}');

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is required' });
    }

    const line_items = cart
      .map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item?.name || 'Baby Belle item',
            images: item?.image ? [item.image] : []
          },
          unit_amount: Math.round(Number(item?.price) * 100)
        },
        quantity: item?.quantity || item?.qty || 1
      }))
      .filter((li) => li.price_data.unit_amount > 0 && li.quantity > 0);

    if (!line_items.length) {
      return res.status(400).json({ error: 'Cart is invalid or empty.' });
    }

    const origin = resolveOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session', error);
    const message = error?.message?.startsWith('Invalid') ? error.message : 'Unable to start checkout.';
    return res.status(400).json({ error: message });
  }
};
