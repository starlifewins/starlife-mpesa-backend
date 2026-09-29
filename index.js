const express = require('express');
const app = express();
app.use(express.json());

function getEnv() {
  return {
    key: process.env.MPESA_CONSUMER_KEY,
    secret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE || '600998',
    env: (process.env.MPESA_ENV || 'sandbox').toLowerCase()
  };
}

async function getToken(key, secret, baseUrl) {
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const r = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  const data = await r.json();
  if (!data.access_token) throw new Error(JSON.stringify(data));
  return data.access_token;
}

app.get("/", (req,res) => {
  res.json({ status: "STARLIFE Running", urls: ["/api/register","/api/validation","/api/confirmation","/api/simulate"] });
});

app.get("/api/register", async (req,res) => {
  try {
    const { key, secret, shortcode, env } = getEnv();
    if (!key || !secret) return res.status(400).json({ error: "Missing KEY/SECRET in Vercel Env Vars" });
    const baseUrl = env === 'sandbox' ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';
    const token = await getToken(key, secret, baseUrl);
    const host = req.headers.host;
    const body = {
      ShortCode: shortcode,
      ResponseType: "Completed",
      ConfirmationURL: `https://${host}/api/confirmation`,
      ValidationURL: `https://${host}/api/validation`
    };
    const reg = await fetch(`${baseUrl}/mpesa/c2b/v1/registerurl`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await reg.json();
    return res.status(reg.status).json({ sent: body, result, token_ok: true });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/validation", (req,res) => {
  console.log("VALIDATION", req.body);
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.post("/api/confirmation", (req,res) => {
  console.log("CONFIRMATION", req.body);
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

app.get("/api/simulate", async (req,res) => {
  try {
    const { key, secret, shortcode } = getEnv();
    const baseUrl = 'https://sandbox.safaricom.co.ke';
    const token = await getToken(key, secret, baseUrl);
    const sim = await fetch(`${baseUrl}/mpesa/c2b/v1/simulate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ShortCode: shortcode, CommandID: "CustomerPayBillOnline", Amount: "1", Msisdn: "254708374149", BillRefNumber: "TEST" })
    });
    const data = await sim.json();
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = app;
