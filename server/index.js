import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const DIST = path.resolve(__dirname, '../client/dist');
const MESSAGES = path.join(__dirname, 'data', 'messages.json');
const profile = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'profile.json'), 'utf8'));

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/api/profile', (_req, res) => res.json(profile));

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const clean = (v, max) => String(v ?? '').trim().slice(0, max);

function saveMessage(entry) {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(MESSAGES, 'utf8')); } catch { /* first message */ }
  list.push(entry);
  fs.writeFileSync(MESSAGES, JSON.stringify(list, null, 2));
}

async function maybeEmail(entry) {
  if (!process.env.SMTP_HOST) return;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.CONTACT_TO || profile.email,
    replyTo: entry.email,
    subject: `Portfolio enquiry from ${entry.name}`,
    text: `${entry.message}\n\n— ${entry.name}\n${entry.email}\n${entry.phone || ''}`,
  });
}

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, phone, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: silently drop bots
  const entry = {
    name: clean(name, 100), email: clean(email, 150), phone: clean(phone, 30),
    message: clean(message, 2000), at: new Date().toISOString(),
  };
  if (!entry.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entry.email) || entry.message.length < 5) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, a valid email and a message.' });
  }
  try {
    saveMessage(entry);
    await maybeEmail(entry).catch((e) => console.error('mail failed:', e.message));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Could not save your message. Please email me directly.' });
  }
});

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));
