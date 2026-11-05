import Split from './Split.jsx';

export default function Hero({ profile, onHire }) {
  return (
    <section id="home" className="hero" data-acc="#7c5cff,#ff4d8d">
      <div className="hero-copy">
        <p className="eyebrow reveal">{profile.role} · {profile.company}</p>
        <Split as="h1" text={`Hi, I'm *${profile.firstName}*. I'm a full-stack developer and data analyst.`} />
        <p className="lede reveal">{profile.summary}</p>
        <div className="row reveal">
          <button className="btn" onClick={onHire}>Hire me</button>
          <a className="btn ghost" href="#work">See my work</a>
        </div>
        <p className="status reveal"><span className="dot" /> Available for work · Remote-first, worldwide</p>
      </div>
      <div className="stage reveal">
        <div className="card" data-tilt="14">
          <span className="glow" />
          <div className="photo"><img src="/harsha.jpg" alt={`Portrait of ${profile.name}`} /></div>
          <div className="card-meta">
            <strong>{profile.name}</strong>
            <span>{profile.location}</span>
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
