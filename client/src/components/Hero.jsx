import { useRef } from 'react';

export default function Hero({ profile, onHire }) {
  const card = useRef(null);
  const tilt = (e) => {
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.current.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  };
  const reset = () => { card.current.style.transform = ''; };
  return (
    <section id="home" className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{profile.role} · {profile.company}</p>
        <h1>Hi, I'm <em>{profile.firstName}</em>. I'm a full-stack developer and data analyst.</h1>
        <p className="lede">{profile.summary}</p>
        <div className="row">
          <button className="btn" onClick={onHire}>Hire me</button>
          <a className="btn ghost" href="#work">See my work</a>
        </div>
        <p className="status"><span className="dot" /> Available for work · Remote-first, worldwide</p>
      </div>
      <div className="card" ref={card} onMouseMove={tilt} onMouseLeave={reset}>
        <img src="/harsha.jpg" alt={`Portrait of ${profile.name}`} />
        <div className="card-meta">
          <strong>{profile.name}</strong>
          <span>{profile.location}</span>
          <span className="chips"><i>Laravel</i><i>Python</i><i>SQL</i><i>Power BI</i></span>
        </div>
      </div>
      <a className="scroll-cue" href="#work">Scroll to explore ↓</a>
    </section>
  );
}
