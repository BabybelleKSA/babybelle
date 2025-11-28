const Stripe = require('stripe');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? Stripe(stripeSecret) : null;

const productCatalog = {
  footies: {
    blush_pink: { title: 'Blush Pink Footie', color: 'Blush Pink', priceCents: 2350 },
    lavender: { title: 'Lavender Footie', color: 'Lavender', priceCents: 2350 },
    pastel_pea: { title: 'Pastel Pea Footie', color: 'Pastel Pea', priceCents: 2350 },
    pure_white: { title: 'Pure White Footie', color: 'Pure White', priceCents: 2350 }
  },
  rompers: {
    blush_pink: { title: 'Blush Pink Romper', color: 'Blush Pink', priceCents: 2350 },
    ocean_blue: { title: 'Ocean Blue Romper', color: 'Ocean Blue', priceCents: 2350 },
    pastel_pea: { title: 'Pastel Pea Romper', color: 'Pastel Pea', priceCents: 2350 },
    pure_white: { title: 'Pure White Romper', color: 'Pure White', priceCents: 2350 }
  }
};

const formatColor = (slug) => slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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

const normalizeCartItem = (item) => {
  if (!item || typeof item !== 'object') throw new Error('Invalid cart item');
  const { type, slug, size, qty } = item;
  const product = productCatalog[type]?.[slug];
  if (!product) throw new Error('Invalid product selection');
  if (!size || typeof size !== 'string') throw new Error('Invalid size');

  const quantity = Number(qty);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Invalid quantity');

  const unitAmount = Number(product.priceCents);
  if (!Number.isInteger(unitAmount) || unitAmount <= 0) throw new Error('Invalid price configuration');

  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${product.title} - ${formatColor(slug)} - Size ${size}`,
        metadata: { type, slug, size, color: product.color }
      },
      unit_amount: unitAmount
    },
    quantity
  };
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
    const { cart } = req.body || {};
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is required' });
    }

    const lineItems = cart.map(normalizeCartItem);
    const origin = resolveOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/?status=success`,
      cancel_url: `${origin}/?status=cancelled`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session', error);
    const message = error?.message?.startsWith('Invalid') ? error.message : 'Unable to start checkout.';
    return res.status(400).json({ error: message });
  }
};
