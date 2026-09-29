const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const BASE_URL = "https://starlifec2b.vercel.app";
const CONFIRMATION_URL = BASE_URL + "/api/confirmation";
const VALIDATION_URL = BASE_URL + "/api/validation";
const SHORTCODE = "7148888";

// --- PUT YOUR REAL DARAJA KEYS HERE ---
const CONSUMER_KEY = "iE37H4u1Y0QvGgJbX9lK8pF2A6bC5dE7";
const CONSUMER_SECRET = "aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV";

const DARAJA_URL = "https://api.safaricom.co.ke";

app.get('/', (req, res) => {
  res.send('STARLIFE M-Pesa Backend Running - Ready!');
});

app.post('/api/validation', (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.post('/api/confirmation', (req, res) => {
  console.log(req.body);
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

app.get('/api/register', async (req, res) => {
  try {
    const auth = Buffer.from(CONSUMER_KEY + ":" + CONSUMER_SECRET).toString('base64');
    const tokenRes = await axios.get(DARAJA_URL + "/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: "Basic " + auth }
    });
    const token = tokenRes.data.access_token;
    const reg = await axios.post(DARAJA_URL + "/mpesa/c2b/v1/registerurl",
      {
        ShortCode: SHORTCODE,
        ResponseType: "Completed",
        ConfirmationURL: CONFIRMATION_URL,
        ValidationURL: VALIDATION_URL
      },
      { headers: { Authorization: "Bearer " + token } }
    );
    res.json(reg.data);
  } catch (e) {
    res.status(400).json(e.response ? e.response.data : { error: e.message });
  }
});

module.exports = app;
