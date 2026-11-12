import { useEffect, useRef, useState } from 'react';
import Split from './Split.jsx';

const ROLES = ['Full-stack developer', 'Data analyst', 'Dashboard builder', 'Problem solver'];

function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % ROLES.length), 2800); return () => clearInterval(id); }, []);
  return <span className="rot" aria-live="polite"><span key={i} className="rot-in"><em>{ROLES[i]}</em></span></span>;
}

function Stat({ value, label }) {
  const ref = useRef(null);
  const num = typeof value === 'number';
  const [n, setN] = useState(num ? 0 : value);
  useEffect(() => {
    if (!num) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1400); setN(Math.round(value * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value, num]);
  return <div ref={ref}><b>{n}</b><span>{label}</span></div>;
}

export default function Hero({ profile, onHire }) {
  const stats = [
    [profile.projects.length, 'Projects built'],
    [profile.story.filter((s) => /Developer|Analyst/.test(s.title)).length, 'Roles so far'],
    ['4th yr', 'B.Tech · Data Science'],
  ];
  return (
    <section id="home" className="hero" data-acc="#7c5cff,#ff4d8d">
      <div className="hero-copy">
        <p className="eyebrow live reveal">Available for new work</p>
        <h1 className="hero-h1">
          <Split as="span" text={`Hi, I'm ${profile.firstName}.`} />
          <Rotator />
        </h1>
        <p className="lede reveal">{profile.summary}</p>
        <div className="row reveal">
          <button className="btn" onClick={onHire}>Hire me</button>
          <a className="btn ghost" href="#work">See my work</a>
        </div>
        <div className="stats reveal">
          {stats.map(([n, l]) => <Stat key={l} value={n} label={l} />)}
        </div>
      </div>
      <div className="stage reveal">
        <div className="portrait" data-tilt="8">
          <span className="orb o1" /><span className="orb o2" />
          <span className="orbit r1"><i /></span><span className="orbit r2"><i /></span>
          <div className="arch" />
          <img className="cut" src="/harsha-cutout.webp" alt={`Portrait of ${profile.name}`} />
          <div className="namecard">
            <strong>{profile.name}</strong>
            <span>{profile.role} · {profile.company}</span>
          </div>
          <span className="badge b1">Laravel</span>
          <span className="badge b2">Python</span>
          <span className="badge b3">Power BI</span>
          <span className="badge b4">SQL</span>
        </div>
      </div>
      <div className="floor" aria-hidden="true" />
      <a className="scroll-cue" href="#work">Scroll to explore ↓</a>
    </section>
  );
}
