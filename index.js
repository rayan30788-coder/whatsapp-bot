const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '12345';

app.get('/', (req, res) => res.send('Bot is running'));

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (msg) {
      const from = msg.from;
      const text = msg.text?.body?.toLowerCase() || '';
      let reply = '';
      if (text.includes('1') || text.includes('שעות')) {
        reply = 'אנחנו פתוחים א-ה 09:00-18:00';
      } else if (text.includes('2') || text.includes('כתובת')) {
        reply = 'הכתובת שלנו: תעדכן אותי ואשנה כאן';
      } else {
        reply = היי! 👋\nתכתוב:\n1 - שעות פתיחה\n2 - כתובת\n3 - לדבר עם נציג;
      }
      await axios.post(https://graph.facebook.com/v20.0/${PHONE_ID}/messages, {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      }, { headers: { Authorization: Bearer ${TOKEN} } });
    }
    res.sendStatus(200);
  } catch (e) {
    console.log(e.response?.data || e.message);
    res.sendStatus(200);
  }
});

app.listen(10000, () => console.log('running'));
