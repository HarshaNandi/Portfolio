export default function CtaBand({ onHire }) {
  return (
    <section className="cta reveal">
      <p className="eyebrow">Available for new work</p>
      <h2>Need something built? Let's make it <em>happen</em>.</h2>
      <p>Tell me what you need — a web app, a dashboard or a data pipeline. I reply within a day.</p>
      <div className="row center">
        <button className="btn" onClick={onHire}>Hire me</button>
        <a className="btn ghost" href="#projects">See my work</a>
      </div>
    </section>
  );
}
