import { useState } from 'react';
import Split from './Split.jsx';

export default function Projects({ projects }) {
  const [f, setF] = useState('All');
  const list = projects.filter((p) => f === 'All' || (f === 'Work') === (p.kind === 'Work'));
  return (
    <section id="projects" className="section" data-acc="#ff8a1f,#ff4d4d">
      <div className="section-head">
        <p className="eyebrow reveal">Selected projects</p>
        <Split text="Things I've *built*" />
        <div className="filters reveal">{['All', 'Work', 'Data'].map((k) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{k}</button>)}</div>
      </div>
      <div className="grid">
        {list.map((p, i) => (
          <article key={p.title} className={`proj reveal${p.url ? ' live' : ''}`} data-tilt="10" style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
            <div className="proj-top"><span>{p.kind}</span><span>{p.date}</span></div>
            <h3>{p.url ? <a className="proj-link" href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a> : p.title}</h3>
            <p>{p.text}</p>
            {p.url && <span className="visit">{p.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗</span>}
            <span className="arrow-ico">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}
