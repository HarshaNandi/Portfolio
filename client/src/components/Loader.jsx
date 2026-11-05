import { useEffect, useState } from 'react';

export default function Loader({ onEnter }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPct((p) => { if (p >= 100) { clearInterval(id); return 100; } return p + 2; }), 28);
    return () => clearInterval(id);
  }, []);
  const ready = pct >= 100;
  const enter = () => { setLeaving(true); setTimeout(onEnter, 700); };
  return (
    <div className={`loader ${leaving ? 'leaving' : ''}`} role="dialog" aria-label="Intro">
      <div className="panels">{[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--i': i }} />)}</div>
      <div className="loader-body">
        <div className="cube" aria-hidden="true">{['f', 'b', 'r', 'l', 't', 'u'].map((k) => <i key={k} className={k} />)}</div>
        <p className="loader-label">{ready ? 'Card ready' : 'Loading the card'}</p>
        <p className="loader-pct">{String(pct).padStart(3, '0')}<small>%</small></p>
        <p className="loader-title">Opening up the work</p>
        <button className="btn" disabled={!ready} onClick={enter}>{ready ? 'Click to enter' : 'Please wait…'}</button>
      </div>
    </div>
  );
}
