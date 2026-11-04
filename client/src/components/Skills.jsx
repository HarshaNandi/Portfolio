export default function Skills({ skills }) {
  return (
    <section id="toolbox" className="section">
      <div className="section-head reveal">
        <p className="eyebrow">Toolbox</p>
        <h2>What I work <em>with</em></h2>
      </div>
      <div className="skills">
        {skills.map((g) => (
          <div key={g.group} className="skill-group reveal">
            <h3>{g.group}</h3>
            <div className="chips">{g.items.map((s) => <i key={s}>{s}</i>)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
