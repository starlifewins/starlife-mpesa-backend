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
    time: new Date().toISOString()
  });
});

app.get('/api/callback', (req, res) => {
  res.json({ message: 'Callback URL is working!' });
});

app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    let cleanPhone = phone.replace(/\D/g,'');
    if(cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
    if(cleanPhone.startsWith('7')) cleanPhone = '254' + cleanPhone;

    const shortCode = process.env.MPESA_SHORTCODE || '174379';
    const passkey = process.env.MPESA_PASSKEY;
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const env = process.env.MPESA_ENV || 'sandbox';

    if(!passkey) return res.status(400).json({ error: 'Missing MPESA_PASSKEY in Vercel' });
    if(!consumerKey) return res.status(400).json({ error: 'Missing MPESA_CONSUMER_KEY in Vercel' });
    if(!consumerSecret) return res.status(400).json({ error: 'Missing MPESA_CONSUMER_SECRET in Vercel' });

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenUrl = env === 'production' ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    
    const tokenRes = await axios.get(tokenUrl, { headers: { Authorization: `Basic ${auth}` } });
    const token = tokenRes.data.access_token;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0,14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    
    const stkUrl = env === 'production' ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest' : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const stkRes = await axios.post(stkUrl, {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount || 1,
      PartyA: cleanPhone,
      PartyB: shortCode,
      PhoneNumber: cleanPhone,
      CallBackURL: 'https://starlife-mpesa-backend.vercel.app/api/callback',
      AccountReference: 'STARLIFE',
      TransactionDesc: 'Starlife Activation'
    }, { headers: { Authorization: `Bearer ${token}` } });

    res.json(stkRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

app.post('/api/callback', (req, res) => {
  console.log('CALLBACK:', JSON.stringify(req.body));
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = app;
