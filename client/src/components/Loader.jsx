import { useEffect, useState } from 'react';

export default function Loader({ onEnter }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPct((p) => { if (p >= 100) { clearInterval(id); return 100; } return p + 4; }), 40);
    return () => clearInterval(id);
  }, []);
  const ready = pct >= 100;
  const enter = () => { setLeaving(true); setTimeout(onEnter, 600); };
  return (
    <div className={`loader ${leaving ? 'leaving' : ''}`} role="dialog" aria-label="Intro">
      <p className="loader-label">{ready ? 'Card ready' : 'Loading the card'}</p>
      <p className="loader-pct">{String(pct).padStart(3, '0')}%</p>
      <p className="loader-title">Opening up the work</p>
      <button className="btn ghost" disabled={!ready} onClick={enter}>{ready ? 'Click to enter' : 'Please wait…'}</button>
    </div>
  );
}
