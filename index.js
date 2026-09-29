const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

function sendMessage(to, body) {
  return axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
    messaging_product: "whatsapp",
    to: to,
    text: { body: body }
  }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
}

function sendMenu(to) {
  return axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
    messaging_product: "whatsapp",
    to: to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "ברוך הבא ל- Alhana 👋\n\n⚠️ שים לב: לא ניתן לבצע הזמנות בהתכתבות.\nההזמנות מתבצעות באתר ובאפליקציה בלבד.\n\nמספר זה מיועד לתלונות ובירורים בלבד." },
      action: {
        buttons: [
          { type: "reply", reply: { id: "orders", title: "🛒 איך מזמינים?" } },
          { type: "reply", reply: { id: "hours", title: "🕘 שעות פתיחה" } },
          { type: "reply", reply: { id: "human", title: "👨‍💼 תלונה/בירור" } }
        ]
      }
    }
  }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
}

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
    if (!msg) return res.sendStatus(200);

    const from = msg.from;
    const text = msg.text?.body || "";
    const buttonId = msg.interactive?.button_reply?.id || text.toLowerCase();

    if (buttonId === "orders" || text.includes("הזמנה")) {
      await sendMessage(from, "🛒 *הבהרה חשובה - Alhana*\n\nלא ניתן לבצע הזמנות דרך הוואטסאפ.\n\nההזמנות מתבצעות אך ורק כאן:\n🔗 אתר: https://alhana.online\n📱 אפליקציה: חפשו Alhana בחנות\n\nמספר וואטסאפ זה מיועד ל *תלונות ובירורים* בלבד.\nתודה על ההבנה 🙏");
    } else if (buttonId === "hours") {
      await sendMessage(from, "🕘 שעות מענה בוואטסאפ (תלונות/בירורים):\nא'-ה' 09:00-18:00\nו' 09:00-14:00");
    } else if (buttonId === "human") {
      await sendMessage(from, "👨‍💼 צוות Alhana כאן לעזור!\nאנא כתוב את פנייתך בצורה מפורטת כולל מספר הזמנה אם יש, ונחזור אליך בהקדם.\n\nשוב מזכירים: לא ניתן להזמין דרך הצ'אט, רק דרך https://alhana.online");
    } else {
      await sendMenu(from);
    }
    res.sendStatus(200);
  } catch (e) {
    console.log(e.response?.data || e.message);
    res.sendStatus(200);
  }
});

app.get('/', (req, res) => res.send('Alhana Support Bot is running ✅'));
app.listen(process.env.PORT || 10000, () => console.log('Server running'));
