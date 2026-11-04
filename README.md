# Harsha Nandi — Portfolio

Full-stack portfolio inspired by the "ability card" style of therishithakor.com, built with my own content.

- **Frontend:** React 18 + Vite — intro loader, hero card, swipeable "doors" for each skill, paginated career timeline, project grid with filter, toolbox, contact modal, live Kolkata clock.
- **Backend:** Node + Express — `GET /api/profile`, `POST /api/contact` (validation, honeypot, rate-limit, JSON storage, optional SMTP email), serves the built frontend in production.
- **Content:** edit `server/data/profile.json` — the site updates from that single file.

## Run

```bash
npm install
npm run dev                  # API on :4000, site on http://localhost:5173
npm run build && npm start   # production on http://localhost:4000
```

Copy `.env.example` to `.env` and set SMTP values to get contact-form messages emailed; otherwise they're saved to `server/data/messages.json`.
