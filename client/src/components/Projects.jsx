import { useState } from 'react';

export default function Projects({ projects }) {
  const kinds = ['All', ...new Set(projects.map((p) => (p.kind === 'Work' ? 'Work' : 'Data')))];
  const [f, setF] = useState('All');
  const list = projects.filter((p) => f === 'All' || (f === 'Work') === (p.kind === 'Work'));
  return (
    <section id="projects" className="section">
      <div className="section-head reveal">
        <p className="eyebrow">Selected projects</p>
        <h2>Things I've <em>built</em></h2>
        <div className="filters">{kinds.map((k) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{k}</button>)}</div>
      </div>
      <div className="grid">
        {list.map((p) => (
          <article key={p.title} className="proj reveal">
            <div className="proj-top"><span>{p.kind}</span><span>{p.date}</span></div>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
