# Restaurant ChatBot

A restaurant ordering chatbot built with React + Vite (frontend) and Node.js + Express (backend). Features real-time Paystack payment processing with secure verification.

## Features

✅ Device-based session management  
✅ Interactive menu ordering  
✅ Real-time order tracking  
✅ **Paystack payment integration** with backend verification  
✅ Order history  
✅ Order scheduling  
✅ One-command deployment to Render  

## Quick Start

### 1. Configure Paystack Credentials

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Paystack keys from https://dashboard.paystack.com
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally (Development)

**Terminal 1 - Frontend**
```bash
npm run dev
```

**Terminal 2 - Backend**
```bash
npm run dev:server
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Testing Payments

Use these test credentials in the Paystack modal:

| Field | Value |
|-------|-------|
| Card Number | `4011 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `123456` |

## Deploy to Render

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Paystack integration"
git push origin main
```

### 2. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PAYSTACK_SECRET_KEY`: Your live secret key
     - `NODE_ENV`: `production`

### 3. Deploy

Render will automatically deploy on every push to main!

Your app will be live at: `https://your-service-name.onrender.com`

## Architecture

```
Frontend (React/Vite)
    ↓ (payment request)
Backend (Express)
    ↓ (verification)
Paystack API
    ↓ (verification response)
Backend
    ↓ (result)
Frontend (show confirmation)
```

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | Backend API server for payment verification |
| `src/App.jsx` | Main chatbot component with payment flow |
| `package.json` | Dependencies and scripts |
| `.env` | Environment variables (local only) |
| `render.yaml` | Render deployment configuration |
| `DEPLOYMENT.md` | Detailed deployment guide |

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_PAYSTACK_PUBLIC_KEY` | Frontend payment modal | `pk_test_xxxx` |
| `PAYSTACK_SECRET_KEY` | Backend verification | `sk_test_xxxx` |
| `VITE_API_URL` | Backend URL (frontend) | `http://localhost:3000` |
| `NODE_ENV` | Deployment environment | `development` \| `production` |

**Note**: Never commit `.env` to Git. It's already in `.gitignore`.

## API Endpoints

### POST /api/verify-payment

Verifies a Paystack payment reference.

**Request:**
```json
{
  "reference": "1719923456-ORD-123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reference": "1719923456-ORD-123456",
    "amount": 2500,
    "customer_email": "user@example.com"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Payment verification failed"
}
```

### GET /api/health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-07-02T10:30:00.000Z"
}
```

## Development Commands

```bash
npm run dev           # Start frontend dev server
npm run dev:server    # Start backend dev server
npm run build         # Build frontend for production
npm start             # Start production server (runs backend + serves dist)
npm run preview       # Preview production build
```

## Switching from Test to Live Payments

1. In Paystack Dashboard, toggle to **Live Mode**
2. Get your **Live** Public and Secret Keys
3. Update `PAYSTACK_SECRET_KEY` on Render
4. Restart your Render service
5. Test payment flow end-to-end

⚠️ **Important**: Test payments will fail with live keys!

## Troubleshooting

**Payment window won't open**
- Check if popups are blocked in your browser
- Verify `VITE_PAYSTACK_PUBLIC_KEY` is correctly set
- Check browser console for errors

**Payment verification fails**
- Verify `PAYSTACK_SECRET_KEY` is set on Render
- Check Render logs: Dashboard → Service → Logs tab
- Ensure network allows calls to `api.paystack.co`

**Build fails on Render**
- Check build logs in Render dashboard
- Verify `npm run build` works locally
- Ensure all dependencies in `package.json`

**CORS errors**
- Backend includes CORS middleware for all origins
- Check for network/firewall issues

## For More Details

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🔗 [Paystack Documentation](https://paystack.com/docs)
- 🚀 [Render Documentation](https://render.com/docs)
- ⚛️ [React Documentation](https://react.dev)
