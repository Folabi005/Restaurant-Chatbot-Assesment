import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load .env file manually
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.use(cors());
app.use(express.json());

// Verify payment with Paystack
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body;
    console.log('Payment verification request:', { reference, isTestMode: PAYSTACK_SECRET_KEY?.includes('sk_test') });

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Paystack secret key not configured' });
    }

    // Check if we're in test mode
    const isTestMode = PAYSTACK_SECRET_KEY.includes('sk_test');
    
    // For test mode, accept any reference that contains the order ID
    if (isTestMode && reference.includes('-ORD-')) {
      console.log('✓ Payment verified in test mode:', reference);
      return res.json({
        success: true,
        message: 'Payment verified successfully (test mode)',
        data: {
          reference: reference,
          amount: 2500, // Default test amount
          customer_email: 'customer@example.com',
          metadata: {
            test_mode: true
          }
        }
      });
    }

    console.log('Attempting to verify with Paystack API...');
    // For production or real verification, call Paystack API
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await verifyResponse.json();
    console.log('Paystack API response:', data);

    if (data.status && data.data.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert from kobo to naira
          customer_email: data.data.customer.email,
          metadata: data.data.metadata
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      status: data.data?.status
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from dist folder for production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (PAYSTACK_SECRET_KEY) {
    console.log('✓ Paystack secret key configured');
  } else {
    console.log('⚠ Warning: Paystack secret key not configured');
  }
});
