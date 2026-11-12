import Split from './Split.jsx';
import SkillSphere from './SkillSphere.jsx';

export default function Skills({ skills }) {
  return (
    <section id="toolbox" className="section" data-acc="#2f80ff,#7c5cff">
      <div className="section-head">
        <p className="eyebrow reveal">Toolbox</p>
        <Split text="What I work *with*" />
      </div>
      <div className="skills-wrap">
        <SkillSphere skills={skills} />
        <div className="skills">
          {skills.map((g, i) => (
            <div key={g.group} className="skill-group reveal" data-tilt="5" style={{ transitionDelay: `${i * 70}ms` }}>
              <h3>{g.group}</h3>
              <div className="chips">{g.items.map((s) => <i key={s}>{s}</i>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
