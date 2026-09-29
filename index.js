const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('STARLIFE M-Pesa Backend Running ✅ - Ready!');
});

app.get('/api/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'STARLIFE Backend LIVE!',
    hasPasskey: !!process.env.MPESA_PASSKEY,
    hasConsumerKey: !!process.env.MPESA_CONSUMER_KEY,
    hasConsumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
    time: new Date().toISOString()
  });
});

// M-Pesa Validation
app.post('/api/mpesa/validation', (req, res) => {
  console.log('Validation:', req.body);
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// M-Pesa Confirmation - Handles BOTH Account1 and Account2!
app.post('/api/mpesa/confirmation', (req, res) => {
  console.log('Confirmation - Account:', req.body.BillRefNumber, 'Amount:', req.body.TransAmount);
  // Here you save to DB - BillRefNumber will be Account1 or Account2 or any name!
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ONE-CLICK REGISTER - For BOTH accounts
app.get('/api/register', async (req, res) => {
  try {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    if (!key || !secret) return res.json({ error: 'Missing CONSUMER KEY/SECRET in Vercel env' });
    
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const tokenRes = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const access_token = tokenRes.data.access_token;

    const regRes = await axios.post('https://sandbox.safaricom.co.ke/mpesa/c2b/v2/registerurl',
      {
        ShortCode: '600998',
        ResponseType: 'Completed',
        ConfirmationURL: 'https://starlife-mpesa-backend.vercel.app/api/mpesa/confirmation',
        ValidationURL: 'https://starlife-mpesa-backend.vercel.app/api/mpesa/validation'
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    res.json(regRes.data);
  } catch (e) {
    res.json({ error: e.message, details: e.response?.data });
  }
});

module.exports = app;
