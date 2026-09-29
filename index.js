const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages[0]) {
      const from = messages[0].from;
      const text = messages[0].text?.body || "";

      let reply = "היי! 👋\nתכתוב:\n1 - שעות פתיחה\n2 - כתובת\n3 - לדבר עם נציג";

      if (text === "1") reply = "אנחנו פתוחים א-ה 9:00-18:00";
      if (text === "2") reply = "הכתובת שלנו: מג'אר";
      if (text === "3") reply = "נציג יחזור אליך בהקדם";

      await axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      }, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
      });
    }
    res.sendStatus(200);
  } catch (e) {
    console.log(e.response?.data || e.message);
    res.sendStatus(200);
  }
});

app.get('/', (req, res) => res.send('Bot is running'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server is running on ' + PORT));
