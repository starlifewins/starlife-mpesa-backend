const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const CONSUMER_KEY = "7dV44d1v1kG6uXyQpLmN2bVcD8eFgHjK";
const CONSUMER_SECRET = "PUT_YOUR_SECRET_HERE";
const SHORTCODE = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
async function getToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', { headers: { Authorization: `Basic ${auth}` } });
  return res.data.access_token;
}
app.get('/', (req, res) => res.send('STARLIFE M-Pesa Backend Running'));
app.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    let formattedPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone;
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0,14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount || 1,
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: "https://starlife-mpesa-backend.onrender.com/callback",
      AccountReference: "STARLIFE",
      TransactionDesc: "Starlife Ticket"
    };
    const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, { headers: { Authorization: `Bearer ${token}` } });
    res.json(response.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});
app.post('/callback', (req, res) => { console.log(req.body); res.json({ ResultCode: 0, ResultDesc: "OK" }); });
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
