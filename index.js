const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// === CONFIG ===
const BASE_URL = "https://starlife-mpesa-backend.vercel.app";
const SHORTCODE = "7148888";
const CONFIRMATION_URL = BASE_URL + "/api/confirmation";
const VALIDATION_URL = BASE_URL + "/api/validation";
const DARAJA_URL = "https://api.safaricom.co.ke";

// === PASTE YOUR REAL DARAJA LIVE KEYS HERE ===
const CONSUMER_KEY = "PASTE_YOUR_REAL_CONSUMER_KEY_HERE";
const CONSUMER_SECRET = "PASTE_YOUR_REAL_CONSUMER_SECRET_HERE";

// === ROUTES ===
app.get('/', (req, res) => {
  res.send('STARLIFE M-Pesa Backend Running - Ready!');
});

app.post('/api/validation', (req, res) => {
  console.log("Validation Hit:", JSON.stringify(req.body));
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.post('/api/confirmation', (req, res) => {
  console.log("Confirmation Hit:", JSON.stringify(req.body));
  // TODO: Save to DB and unlock user account
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

app.get('/api/register', async (req, res) => {
  try {
    if (CONSUMER_KEY.includes("PASTE_YOUR")) {
      return res.status(400).json({ error: "Please paste your real DARAJA keys in index.js first!" });
    }

    const auth = Buffer.from(CONSUMER_KEY + ":" + CONSUMER_SECRET).toString('base64');
    
    const tokenRes = await axios.get(
      DARAJA_URL + "/oauth/v1/generate?grant_type=
