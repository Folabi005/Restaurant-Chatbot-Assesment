# Paystack Payment Integration & Render Deployment Guide

## Overview

This project is a Restaurant ChatBot with integrated Paystack payment processing. It consists of:
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express (payment verification)
- **Payments**: Paystack API integration

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm
- Paystack account (free tier available)

### 1. Get Paystack Credentials

1. Sign up at [Paystack](https://paystack.com)
2. Go to **Settings > Developers**
3. Copy your **Public Key** and **Secret Key** (test mode)

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual keys
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Mode

**Terminal 1 - Frontend (Vite dev server)**
```bash
npm run dev
```

**Terminal 2 - Backend (Node server)**
```bash
npm run dev:server
```

Frontend will be at `http://localhost:5173`
Backend will be at `http://localhost:3000`

## Production Deployment on Render

### 1. Connect Your Repository

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New +** → **Web Service**
4. Connect your GitHub repository

### 2. Configure Render Service

**Basic Settings:**
- **Name**: `restaurant-chatbot`
- **Environment**: Node
- **Region**: Choose nearest to your users
- **Branch**: main (or your default branch)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**

Add these in the Render dashboard under **Environment**:

```
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key_here
NODE_ENV=production
```

⚠️ **IMPORTANT**: Use your **LIVE** Paystack keys for production, not test keys!

### 3. Auto-Deploy

Once connected, Render will:
1. Automatically deploy on every push to main branch
2. Run build command
3. Start the production server

Your app will be available at: `https://restaurant-chatbot-xxxxx.onrender.com`

## How Payment Works

### Flow Diagram

```
User → Opens Paystack Payment Modal
         ↓
User → Enters Payment Details
         ↓
Paystack → Returns Payment Reference
         ↓
Frontend → Calls Backend /api/verify-payment
         ↓
Backend → Verifies with Paystack API
         ↓
Backend → Returns Status to Frontend
         ↓
Frontend → Shows Confirmation & Routes Back to Chatbot
```

### Testing Payments

**Test Credentials (Use in Paystack modal):**
- Card Number: `4011 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits
- OTP: 123456 (when prompted)

### Payment Verification

The backend endpoint `/api/verify-payment`:
1. Receives payment reference from frontend
2. Verifies with Paystack's API using your Secret Key
3. Confirms payment status
4. Returns result to frontend

## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|-------------|-----------|-------------|
| `VITE_PAYSTACK_PUBLIC_KEY` | pk_test_* | pk_live_* | Paystack public key |
| `PAYSTACK_SECRET_KEY` | sk_test_* | sk_live_* | Paystack secret key (backend only) |
| `VITE_API_URL` | http://localhost:3000 | https://your-render-url.onrender.com | Backend API URL |
| `NODE_ENV` | development | production | Node environment |
| `PORT` | 3000 | Auto (Render) | Server port |

## Switching from Test to Live Paystack

1. In [Paystack Dashboard](https://dashboard.paystack.com), toggle to **Live** mode
2. Copy your **Live** Public Key and Secret Key
3. Update `PAYSTACK_SECRET_KEY` on Render dashboard
4. Optionally update `VITE_PAYSTACK_PUBLIC_KEY` in code/`.env`
5. Re-deploy: Push code to GitHub or manually trigger Render redeploy

⚠️ **WARNING**: Test payments will fail with live keys!

## Troubleshooting

### "Payment window closed" message
- Ensure popup blockers are disabled
- Check browser console for JavaScript errors
- Verify Paystack public key is correct

### Payment verification fails
- Check backend logs on Render: Dashboard → Service → Logs
- Verify `PAYSTACK_SECRET_KEY` is set correctly on Render
- Ensure network/firewall isn't blocking Paystack API

### CORS errors
- Backend includes CORS middleware for all origins
- Check Render service logs for details

### App not loading on Render
- Check build logs in Render dashboard
- Verify `npm run build` succeeds locally
- Ensure `.gitignore` doesn't exclude needed files

## File Structure

```
.
├── server.js                 # Node.js/Express backend
├── package.json             # Project dependencies & scripts
├── .env                     # Local environment variables (NEVER commit)
├── .env.example            # Template for environment variables
├── render.yaml             # Render deployment configuration
├── index.html              # HTML entry point
├── src/
│   ├── App.jsx            # Main React component (payment integration)
│   ├── main.jsx           # React entry point
│   └── styles.css         # Styling
└── dist/                  # Built files (production)
```

## Key Features

✅ Real-time payment processing with Paystack
✅ Payment verification on backend
✅ Auto-route to chatbot after payment
✅ Order tracking with payment status
✅ One-click deployment to Render
✅ Test and Live payment support

## Support

- **Paystack Docs**: https://paystack.com/docs
- **Render Docs**: https://render.com/docs
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
