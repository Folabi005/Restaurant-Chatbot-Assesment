# Restaurant ChatBot

A simple restaurant ordering chatbot built with React and Vite. Customers can:

- start a chat session from a device-based session
- view a menu and select items using numbered options
- checkout an order
- view current and historical orders
- cancel an active order
- pay with a Paystack test flow when a public key is configured
- schedule an order for a later time

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local URL shown by Vite.

## Environment

To enable live Paystack payments, create a `.env` file in the project root with:

```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
VITE_PAYSTACK_EMAIL=customer@example.com
```

Use your Paystack test public key from a test account. If no key is provided, the app falls back to a simulated confirmation so the flow can still be tested locally.
