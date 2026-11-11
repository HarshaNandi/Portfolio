import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

// Hanging pull-cord: pull it (or click / press Enter) to switch between dark and light themes.
// The new theme expands from the cord as a circular reveal when the browser supports View Transitions.
export function initialTheme() {
  try { const t = localStorage.getItem('theme'); if (t === 'light' || t === 'dark') return t; } catch { /* private mode */ }
  return 'dark';
}

export default function Lamp() {
  const [pull, setPull] = useState(0);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const drag = useRef(null);

  const toggle = (x, y) => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
      try { localStorage.setItem('theme', next); } catch { /* ignore */ }
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return apply();
    const vt = document.startViewTransition(() => flushSync(apply));
    vt.ready.then(() => {
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 1000, easing: 'cubic-bezier(.77,0,.18,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  };

  const down = (e) => { drag.current = { y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (drag.current) setPull(Math.max(0, Math.min(80, e.clientY - drag.current.y))); };
  const up = (e) => {
    if (!drag.current) return;
    const moved = pull; drag.current = null; setPull(0);
    if (moved > 26 || moved < 4) toggle(e.clientX, e.clientY);
  };
  const key = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect();
      toggle(r.left + r.width / 2, r.top + r.height / 2);
    }
  };

  return (
    <div className="lamp" aria-hidden={false}>
      <div className={`rope ${drag.current ? 'drag' : ''}`} style={{ height: 150 + pull }} />
      <button
        className={`pull ${drag.current ? 'drag' : ''}`} style={{ transform: `translate(-50%,${pull}px)` }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
        aria-label={`Pull to switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Pull the cord"
      />
    </div>
  );
}
