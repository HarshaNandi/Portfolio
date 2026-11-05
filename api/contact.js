// Vercel serverless function: POST /api/contact
// Vercel has no writable disk, so messages are delivered by email via SMTP env vars.
const nodemailer = require('nodemailer');
const profile = require('../server/data/profile.json');

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { name, email, phone, message, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true }); // honeypot
  const entry = { name: clean(name, 100), email: clean(email, 150), phone: clean(phone, 30), message: clean(message, 2000) };
  if (!entry.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entry.email) || entry.message.length < 5) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, a valid email and a message.' });
  }
  if (!process.env.SMTP_HOST) {
    return res.status(503).json({ ok: false, error: 'Contact form is not configured yet.' });
  }
  try {
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
      text: `${entry.message}\n\n— ${entry.name}\n${entry.email}\n${entry.phone}`,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Could not send your message. Please email me directly.' });
  }
};
