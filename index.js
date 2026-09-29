app.get('/api/register', async (req, res) => {
  try {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    if (!key || !secret) return res.json({ error: 'Missing CONSUMER KEY/SECRET in Vercel env' });
    
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const tokenRes = await require('axios').get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const access_token = tokenRes.data.access_token;

    const regRes = await require('axios').post('https://sandbox.safaricom.co.ke/mpesa/c2b/v2/registerurl',
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
