# Baby Belle

## Stripe checkout on Vercel
- Deploy by importing this repo into Vercel (select the root of the project). Vercel will automatically expose `/api/create-checkout.js` as a serverless function.
- In Vercel, go to **Project Settings → Environment Variables**, add `STRIPE_SECRET_KEY` with your Stripe secret key, and redeploy. Add it to all environments you plan to use.
- Local testing: run `npm install` (installs the Stripe dependency) then start with `vercel dev` so `/api/create-checkout` is available.

## How `/api/create-checkout.js` works
- Accepts `POST` requests with `{ cart: [...] }`, validates that each item matches the known catalog (type, slug, size, qty), and ignores empty or malformed carts.
- Builds Stripe `line_items` using `price_data` with `product_data` that includes the product name, color, and size; `unit_amount` is stored in cents on the server to avoid tampering.
- Creates a Stripe Checkout Session via `stripe.checkout.sessions.create()`, using the request origin for `success_url` and `cancel_url`, and returns `{ url: session.url }` for the frontend to redirect.

## Frontend checkout flow
- The cart UI remains unchanged; items are stored in `localStorage` (`babybelle-cart`) and mirrored to `window.cartItems` for compatibility.
- When the Checkout button is clicked, the script reads the cart from `window.cartItems` if present, otherwise falls back to `localStorage`.
- It sends `fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart }) })`.
- If the response includes a `url`, the browser is redirected to Stripe to pay; errors are logged and surfaced with a simple alert so the user can retry.
