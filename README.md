# Harsha Nandi — Portfolio

Full-stack portfolio inspired by the "ability card" style of therishithakor.com, built with my own content.

- **Frontend:** React 18 + Vite + three.js — 3D developer scene — a glowing DNA-style data helix with pulses, orbiting rings and glowing code symbols — flown through by a scroll-driven camera and changes colour per section, 3D loader cube with curtain reveal, curtain-wipe page transitions, masked word-by-word headings, 3D-tilting hero card, swipeable 3D "doors", flip-through career timeline, marquee bands, custom cursor, magnetic buttons, contact modal, live Kolkata clock.
- **Look:** modelled on the reference — flat top bar with a live local-time pill, bold two-tone headlines, a hanging pull-cord that switches dark ⇄ cream light with a circular reveal, big "Need something built?" call-to-action and a three-column footer.
- **Backend:** Node + Express — `GET /api/profile`, `POST /api/contact` (validation, honeypot, rate-limit, JSON storage, optional SMTP email), serves the built frontend in production.
- **Content:** edit `server/data/profile.json` — the site updates from that single file.

## Run

```bash
npm install
npm run dev                  # API on :4000, site on http://localhost:5173
npm run build && npm start   # production on http://localhost:4000
```

Copy `.env.example` to `.env` and set SMTP values to get contact-form messages emailed; otherwise they're saved to `server/data/messages.json`.

## Deploy on Vercel

1. Push this repo to GitHub, then on vercel.com choose **Add New → Project** and import it (leave the root directory as is — `vercel.json` sets the build).
2. Under **Environment Variables** add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` so the contact form can email you (for Gmail use `smtp.gmail.com`, port `587` and an App Password).
3. Deploy. `api/` holds the serverless versions of the Express routes; `server/` is for running locally or on a Node host.
