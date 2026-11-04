import { useState } from 'react';

export default function Story({ story }) {
  const [i, setI] = useState(0);
  const s = story[i];
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <section id="story" className="section">
      <div className="section-head reveal">
        <p className="eyebrow">My story</p>
        <h2>Let's go back in <em>time</em>.</h2>
        <div className="ruler" aria-hidden="true">{'2018 2020 2022 2024 2026'.split(' ').map((y) => <span key={y}>{y}</span>)}</div>
      </div>
      <div className="timeline reveal">
        <div className="tl-count">{pad(i + 1)} <span>/ {pad(story.length)}</span></div>
        <article key={i} className="tl-card">
          <p className="tl-date">{s.date}</p>
          <h3>{s.title}</h3>
          <p className="tl-org">{s.org}</p>
          {s.points.length > 0 && <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>}
        </article>
        <div className="tl-nav">
          <button className="btn small ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Newer</button>
          <div className="dots">{story.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Go to ${k + 1}`} />)}</div>
          <button className="btn small ghost" disabled={i === story.length - 1} onClick={() => setI(i + 1)}>Older →</button>
        </div>
      </div>
    </section>
  );
}
