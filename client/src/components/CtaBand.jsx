import Split from './Split.jsx';

export default function CtaBand({ onHire }) {
  return (
    <section id="cta" className="cta" data-acc="#ff5a36,#ff3d8b">
      <p className="eyebrow reveal">Available for new work</p>
      <Split text="Need something built? Let's make it *happen*." />
      <p className="reveal">Tell me what you need — a web app, a dashboard or a data pipeline. I reply within a day.</p>
      <div className="row center reveal">
        <button className="btn" onClick={onHire}>Hire me</button>
        <a className="btn ghost" href="#projects">See my work</a>
      </div>
    </section>
  );
}
