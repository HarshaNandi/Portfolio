import { useEffect, useState } from 'react';

const WORDS = ['HARSHA', 'NANDI'];
const BOOT = [
  [20, 'Laravel · WordPress', 'web apps'],
  [45, 'Python · SQL · ML', 'data science'],
  [70, 'Power BI · Excel', 'dashboards'],
  [95, 'Portfolio', 'ready'],
];

export default function Loader({ onEnter }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPct((p) => { if (p >= 100) { clearInterval(id); return 100; } return p + 1; }), 34);
    return () => clearInterval(id);
  }, []);
  const ready = pct >= 100;
  const enter = () => { setLeaving(true); setTimeout(onEnter, 800); };
  return (
    <div className={`loader ${leaving ? 'leaving' : ''} ${ready ? 'ready' : ''}`} role="dialog" aria-label="Intro">
      <div className="panels">{[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--i': i }} />)}</div>
      <div className="ld-bg" aria-hidden="true"><i className="blob a" /><i className="blob b" /><i className="blob c" /><i className="ld-grid" /></div>

      <div className="loader-body">
        <div className="core" aria-hidden="true">
          <i className="glow" />
          <i className="ring r1"><b /></i><i className="ring r2"><b /></i><i className="ring r3"><b /></i>
          <i className="sphere" />
          <span className="core-pct">{pct}<small>%</small></span>
        </div>

        <h1 className="ld-name" aria-label="Harsha Nandi">
          {WORDS.map((w, wi) => (
            <span className="ld-word" key={w} aria-hidden="true">
              {w.split('').map((c, i) => <span key={i} style={{ '--i': i + wi * 6 }}>{c}</span>)}
            </span>
          ))}
        </h1>
        <p className="ld-role">Full-stack developer <i>×</i> Data analyst <i>×</i> Dashboard builder</p>

        <ul className="ld-boot" aria-hidden="true">
          {BOOT.map(([at, a, b]) => (
            <li key={a} className={pct >= at ? 'on' : ''}><em>{pct >= at ? '✓' : '·'}</em><strong>{a}</strong><span>{b}</span></li>
          ))}
        </ul>

        <div className="ld-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
        <button className="ld-btn" disabled={!ready} onClick={enter}>
          <span>{ready ? 'Enter portfolio' : 'Booting up…'}</span><b>→</b>
        </button>
      </div>
    </div>
  );
}
