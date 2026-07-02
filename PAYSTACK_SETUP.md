# Paystack Payment Integration Setup Guide

## Overview
This guide walks you through setting up Paystack payment integration for the Restaurant ChatBot application using test mode credentials.

## Prerequisites
- A Paystack account (free tier available)
- Node.js and npm installed
- Your Restaurant ChatBot application running

## Step 1: Get Your Paystack Test Credentials

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Log in to your account (or sign up if you don't have one)
3. Navigate to **Settings** → **Developer** (or **API Keys**)
4. You should see two test keys:
   - **Public Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## Step 2: Configure Environment Variables

1. Open the `.env` file in your project root:

```env
# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here

# API Configuration
VITE_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

2. Replace `pk_test_your_public_key_here` with your actual public key
3. Replace `sk_test_your_secret_key_here` with your actual secret key

### Important Security Notes:
- **Public Key** (`VITE_PAYSTACK_PUBLIC_KEY`): Safe to expose in frontend code (prefixed with `VITE_`)
- **Secret Key** (`PAYSTACK_SECRET_KEY`): Keep this secret! Only used on the backend, never expose to frontend

## Step 3: Start the Application

### Development Mode
```bash
npm run dev:server
```

This will start the backend server on port 3000 and the frontend development server.

### Production Build
```bash
npm run build
npm start
```

## Step 4: Test the Payment Flow

### Using Test Cards

Paystack provides test card numbers for different scenarios:

#### Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

#### Failed Payment
- **Card Number**: `5555 5555 5555 4444`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Payment Flow in the App

1. **Place an Order**
   - Select option `1` to browse the menu
   - Choose items by entering the menu number (1-5)
   - Enter `99` to proceed to checkout

2. **Checkout**
   - Review your order total
   - Click "Pay now"

3. **Payment Modal**
   - The Paystack payment modal will open
   - Enter test card details
   - Click "Make Payment"

4. **Success**
   - On successful payment, you'll be redirected to the chatbot
   - Order status changes to "paid"
   - You'll see a success notification with the order ID and payment reference

## API Endpoints

### Verify Payment
- **Endpoint**: `POST /api/verify-payment`
- **Request Body**:
  ```json
  {
    "reference": "1234567890-ORD-XXXXX"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "data": {
      "reference": "1234567890-ORD-XXXXX",
      "amount": 10000,
      "customer_email": "customer@example.com",
      "metadata": { ... }
    }
  }
  ```
- **Response (Failure)**:
  ```json
  {
    "success": false,
    "message": "Payment verification failed",
    "status": "failed"
  }
  ```

## Troubleshooting

### "Paystack secret key not configured"
- Ensure `PAYSTACK_SECRET_KEY` is set in your `.env` file
- Restart the server after updating `.env`

### Payment Modal Not Opening
- Verify `VITE_PAYSTACK_PUBLIC_KEY` is set correctly in `.env`
- Check browser console for JavaScript errors
- Ensure Paystack script is loaded: `<script src="https://js.paystack.co/v1/inline.js"></script>` in `index.html`

### Payment Verification Failed
- Check that the backend is running and accessible
- Verify the payment reference is being passed correctly
- Check server logs for detailed error messages

### Test Card Declined
- Use the Paystack test cards provided above
- Ensure the card hasn't expired in your test date
- For 3D Secure cards, use the OTP provided (usually any 6 digits)

## Security Best Practices

1. ✅ **Never** commit `.env` to version control
2. ✅ Use different credentials for development and production
3. ✅ Keep your secret key confidential
4. ✅ Regularly rotate your API keys
5. ✅ Use HTTPS in production
6. ✅ Validate payment amounts on the backend
7. ✅ Store payment references securely for audit trails

## Production Deployment

When deploying to production:

1. Obtain production API keys from Paystack dashboard
2. Update environment variables on your hosting platform (e.g., Render, Heroku)
3. Update `VITE_API_URL` to your production API URL
4. Ensure HTTPS is enabled
5. Test a full payment flow before going live

## Support Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Test Cards Documentation](https://paystack.com/docs/testing/)

## Contact & Support

For issues with this integration or questions about the Restaurant ChatBot:
- Check the main README.md
- Review server.js for backend configuration
- Check App.jsx for frontend payment handling logic
