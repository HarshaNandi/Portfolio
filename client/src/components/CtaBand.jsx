import Split from './Split.jsx';

export default function CtaBand({ onHire }) {
  return (
    <section id="cta" className="cta" data-acc="#7c5cff,#ff4d8d">
      <p className="eyebrow live reveal">Available for new work</p>
      <Split text="Need something built? | *Let's make it happen.*" className="big" />
      <p className="reveal">I'm available for freelance work: web apps, dashboards and data projects. Tell me what you need and I'll get back to you within a day.</p>
      <div className="row reveal">
        <button className="btn" onClick={onHire}>Hire me</button>
        <a className="btn ghost" href="#projects">See my work</a>
      </div>
    </section>
  );
}
