const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// --- YOUR LIVE LINKS - NO MPESA WORD ---
const BASE_URL = "https://starlifec2b.vercel.app";
const CONFIRMATION_URL = `${BASE_URL}/api/confirmation`;
const VALIDATION_URL = `${BASE_URL}/api/validation`;

// --- YOUR BUSINESS DETAILS ---
const SHORTCODE = "7148888";
const CONSUMER_KEY = "YOUR_CONSUMER_KEY_HERE";
const CONSUMER_SECRET = "YOUR_CONSUMER_SECRET_HERE";

// Daraja URL - Production
const DARAJA_URL = "https://api.safaricom.co.ke";

// Home route
app.get('/', (req, res) => {
  res.send('STARLIFE M-Pesa Backend Running - Ready!');
});

// Validation - Safaricom calls this first
app.post('/api/validation', (req, res) => {
  console.log('Validation:', req.body);
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Confirmation - Safaricom sends payment here
app.post('/api/confirmation', (req, res) => {
  console.log('Confirmation:', req.body);
  // TODO: Save to your database
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

// REGISTER - Call this to register URLs with Safaricom
app.get('/api/register', async (req, res) => {
  try {
   
