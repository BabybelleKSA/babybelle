// /api/create-checkout.js

const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SALE_MULTIPLIER = 0.85;
const basePrices = {
    footies: 33,
    rompers: 29
};

const resolveUnitAmount = (item = {}) => {
    const base = Number(basePrices[item.type]) || Number(item.price) || 0;
    return Math.round(base * 100 * SALE_MULTIPLIER);
};

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        res.statusCode = 405;
        return res.json({ error: "Method not allowed" });
    }

    try {
        const { cart } = JSON.parse(req.body || "{}");

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            res.statusCode = 400;
            return res.json({ error: "Cart is empty or invalid" });
        }

        const lineItems = cart.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name || "Baby Belle Onesie",
                        description: `${item.color || ""} ${item.size || ""}`.trim(),
                    },
                    unit_amount: resolveUnitAmount(item),
                },
                quantity: item.quantity || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            success_url: "https://buybabybelle.com/success.html",
            cancel_url: "https://buybabybelle.com/cart.html",
        });

        res.statusCode = 200;
        return res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe checkout error:", err);
        res.statusCode = 500;
        return res.json({ error: err.message || "Internal server error" });
    }
};
