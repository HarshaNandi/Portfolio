// Canvas-drawn "screens" for the 3D developer scene: an animated code editor, terminal, API response,
// Python snippet and a mini analytics dashboard. Purely decorative demo content.
const MONO = '"JetBrains Mono","Fira Code",ui-monospace,Menlo,Consolas,monospace';
const COL = { bg: '#0f1226', bar: '#181c3c', text: '#e6e9ff', dim: '#6b7399', kw: '#c792ff', str: '#9dffb0', fn: '#7cc4ff', num: '#ffb86c', key: '#7cc4ff', ok: '#5dffb0', warn: '#ffd166' };
const TOKEN_RE = /(\/\/.*$|#.*$)|("[^"]*"(?=\s*:))|('[^']*'|"[^"]*")|\b(const|let|function|def|return|true|false|new|import|from|as|await|async)\b|\b(\w+)(?=\()|\b(\d+(?:\.\d+)?)\b|(\s+)|(.)/g;
const GROUP_COLORS = [COL.dim, COL.key, COL.str, COL.kw, COL.fn, COL.num, COL.text, COL.text];

function tokens(line) {
  if (typeof line === 'object') return [[line.t, line.c]];
  const out = []; TOKEN_RE.lastIndex = 0; let m;
  while ((m = TOKEN_RE.exec(line)) && m[0] !== '') {
    const g = m.slice(1).findIndex((x) => x !== undefined);
    out.push([m[0], GROUP_COLORS[g]]);
  }
  return out;
}
const lenOf = (l) => (typeof l === 'object' ? l.t.length : l.length);
const totalChars = (lines) => lines.reduce((n, l) => n + lenOf(l), 0) + lines.length - 1;
const typedAt = (t, total, speed = 18, pause = 70) => Math.min(total, Math.floor(t * speed) % (total + pause));

function frame(ctx, w, h, title, accent) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COL.bg; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 30); ctx.fill();
  ctx.fillStyle = COL.bar; ctx.beginPath(); ctx.roundRect(0, 0, w, 64, [30, 30, 0, 0]); ctx.fill();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(38 + i * 30, 32, 9, 0, 7); ctx.fill(); });
  ctx.fillStyle = COL.dim; ctx.font = `500 24px ${MONO}`; ctx.textAlign = 'center'; ctx.fillText(title, w / 2, 40); ctx.textAlign = 'left';
  ctx.strokeStyle = accent; ctx.globalAlpha = 0.7; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 29); ctx.stroke(); ctx.globalAlpha = 1;
}

function drawCode(ctx, lines, typed, o) {
  ctx.font = `${o.fs}px ${MONO}`; ctx.textBaseline = 'alphabetic';
  const cw = ctx.measureText('M').width;
  let left = typed, curX = o.x, curY = o.y;
  for (let i = 0; i < lines.length; i++) {
    const cy = o.y + i * o.lh; let px = o.x;
    if (o.nums) { ctx.fillStyle = COL.dim; ctx.fillText(String(i + 1).padStart(2, ' '), o.x - 62, cy); }
    for (const [txt, col] of tokens(lines[i])) {
      if (left <= 0) break;
      const part = txt.slice(0, left); ctx.fillStyle = col; ctx.fillText(part, px, cy); px += part.length * cw; left -= part.length;
    }
    curX = px; curY = cy;
    if (left <= 0) break;
    left -= 1;
  }
  if (Math.floor(o.t * 2) % 2 === 0) { ctx.fillStyle = COL.text; ctx.fillRect(curX + 3, curY - o.fs + 6, cw * 0.6, o.fs); }
}

const EDITOR = [
  '// harsha.dev.js',
  'const dev = {',
  "  name: 'Harsha Nandi',",
  "  role: 'Full-stack developer',",
  "  stack: ['Laravel', 'Python', 'SQL'],",
  '  openToWork: true,',
  '};',
  '',
  'function build(idea) {',
  '  const api = connect(dev.stack);',
  '  return ship(idea, api);',
  '}',
];
const TERMINAL = [
  { t: '$ npm run build', c: COL.text }, { t: '✓ 53 modules transformed', c: COL.ok }, { t: '✓ built in 2.4s', c: COL.ok },
  { t: '$ git push origin main', c: COL.text }, { t: '→ main -> main', c: COL.dim }, { t: '✓ deployed to vercel', c: COL.ok },
];
const API = [
  { t: 'GET /api/profile', c: COL.fn }, { t: '200 OK · 12ms', c: COL.ok }, '{', '  "name": "Harsha Nandi",', '  "role": "Associate Developer",',
  '  "skills": 19,', '  "available": true', '}',
];
const PY = [
  'import pandas as pd', "df = pd.read_csv('sales.csv')", "trend = df.groupby('month').sum()", 'model.fit(trend)  # forecast', 'print(model.score(trend))',
];

export function createScreens(THREE) {
  const mk = (w, h, draw, animated) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    draw(ctx, w, h, 0); tex.needsUpdate = true;
    return { tex, w, h, tick(t) { if (!animated) return; draw(ctx, w, h, t); tex.needsUpdate = true; } };
  };
  const code = (title, accent, lines, o) => (ctx, w, h, t) => {
    frame(ctx, w, h, title, accent);
    const typed = o.animated ? typedAt(t + (o.offset || 0), totalChars(lines), o.speed) : totalChars(lines);
    drawCode(ctx, lines, typed, { x: o.nums ? 100 : 44, y: 118, lh: o.lh, fs: o.fs, nums: o.nums, t });
  };
  const bars = Array.from({ length: 9 }, (_, i) => 0.35 + ((i * 37) % 55) / 100);
  const dash = (ctx, w, h, t) => {
    frame(ctx, w, h, 'dashboard · demo', '#ff4d8d');
    const tw = (w - 44 * 2 - 24 * 2) / 3;
    [['Revenue', '₹2.4M'], ['Orders', '1,284'], ['Growth', '+24%']].forEach(([l, v], i) => {
      const x = 44 + i * (tw + 24);
      ctx.fillStyle = '#1b2046'; ctx.beginPath(); ctx.roundRect(x, 96, tw, 100, 16); ctx.fill();
      ctx.fillStyle = COL.dim; ctx.font = `500 20px ${MONO}`; ctx.fillText(l, x + 18, 128);
      ctx.fillStyle = i === 2 ? COL.ok : COL.text; ctx.font = `700 36px ${MONO}`; ctx.fillText(v, x + 18, 174);
    });
    const bw = (w - 88) / bars.length; const base = h - 44, maxH = h - 290;
    bars.forEach((b, i) => {
      const hh = maxH * b * (0.78 + 0.22 * Math.sin(t * 1.6 + i * 0.8));
      const g = ctx.createLinearGradient(0, base - hh, 0, base); g.addColorStop(0, '#ff4d8d'); g.addColorStop(1, '#7c5cff');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(44 + i * bw + 6, base - hh, bw - 12, hh, 8); ctx.fill();
    });
    ctx.strokeStyle = '#5dffb0'; ctx.lineWidth = 4; ctx.beginPath();
    bars.forEach((b, i) => { const y = base - maxH * (0.55 + 0.3 * Math.sin(t * 1.2 + i * 0.7)) * 0.9; i ? ctx.lineTo(44 + i * bw + bw / 2, y) : ctx.moveTo(44 + bw / 2, y); });
    ctx.stroke();
  };
  const keyboard = () => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 460; const ctx = c.getContext('2d');
    ctx.fillStyle = '#141729'; ctx.fillRect(0, 0, 1024, 460);
    const rows = [14, 14, 13, 12, 11]; let y = 22;
    rows.forEach((n, r) => {
      const kw = (1024 - 40 - (n - 1) * 8) / n;
      for (let i = 0; i < n; i++) {
        const x = 20 + i * (kw + 8);
        ctx.fillStyle = '#1f2440'; ctx.beginPath(); ctx.roundRect(x, y, kw, 64, 10); ctx.fill();
        ctx.fillStyle = (i + r) % 5 === 0 ? '#7c5cff55' : '#ffffff10'; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, kw - 8, 10, 6); ctx.fill();
      }
      y += 78;
    });
    ctx.fillStyle = '#1f2440'; ctx.beginPath(); ctx.roundRect(260, y, 504, 64, 10); ctx.fill();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return tex;
  };
  return {
    editor: mk(1024, 640, code('harsha.dev.js', '#7c5cff', EDITOR, { animated: true, nums: true, fs: 34, lh: 44, speed: 16 }), true),
    terminal: mk(820, 520, code('zsh — portfolio', '#5dffb0', TERMINAL, { animated: true, nums: false, fs: 32, lh: 52, speed: 14, offset: 3 }), true),
    api: mk(820, 520, code('api · profile', '#7cc4ff', API, { animated: false, nums: false, fs: 30, lh: 50 }), false),
    py: mk(820, 520, code('forecast.py', '#ffb86c', PY, { animated: true, nums: true, fs: 28, lh: 52, speed: 12, offset: 6 }), true),
    dash: mk(820, 520, dash, true),
    keyboard: keyboard(),
  };
}
