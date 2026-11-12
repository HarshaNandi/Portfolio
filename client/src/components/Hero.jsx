import Split from './Split.jsx';

export default function Hero({ profile, onHire }) {
  const stats = [
    [`${profile.projects.length}`, 'Projects built'],
    [`${profile.story.filter((s) => /Developer|Analyst/.test(s.title)).length}`, 'Roles so far'],
    ['4th yr', 'B.Tech · Data Science'],
  ];
  return (
    <section id="home" className="hero" data-acc="#7c5cff,#ff4d8d">
      <div className="hero-copy">
        <p className="eyebrow live reveal">Available for new work</p>
        <Split as="h1" text={`Hi, I'm ${profile.firstName}. | *Full-stack developer & data analyst.*`} />
        <p className="lede reveal">{profile.summary}</p>
        <div className="row reveal">
          <button className="btn" onClick={onHire}>Hire me</button>
          <a className="btn ghost" href="#work">See my work</a>
        </div>
        <div className="stats reveal">
          {stats.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}
        </div>
      </div>
      <div className="stage reveal">
        <div className="portrait" data-tilt="8">
          <span className="orb o1" /><span className="orb o2" />
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
      <a className="scroll-cue" href="#work">Scroll to explore ↓</a>
    </section>
  );
}
