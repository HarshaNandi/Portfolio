import Split from './Split.jsx';
import SkillSphere from './SkillSphere.jsx';
import { GROUP_COLORS } from './colors.js';

export default function Skills({ skills }) {
  const total = skills.reduce((n, g) => n + g.items.length, 0);
  return (
    <section id="toolbox" className="section" data-acc="#2f80ff,#7c5cff">
      <div className="section-head">
        <p className="eyebrow reveal">Toolbox</p>
        <Split text="What I work *with*" />
        <p className="hint reveal">{total} tools across {skills.length} areas — drag the sphere to spin it, hover a skill to pull it forward.</p>
      </div>
      <div className="skills-wrap">
        <SkillSphere skills={skills} />
        <div className="skills">
          {skills.map((g, i) => (
            <div key={g.group} className="skill-group reveal" data-tilt="5" style={{ '--g': GROUP_COLORS[i % GROUP_COLORS.length], transitionDelay: `${i * 70}ms` }}>
              <div className="sg-head"><span className="gnum">{String(i + 1).padStart(2, '0')}</span><h3>{g.group}</h3><span className="gcount">{g.items.length}</span></div>
              <div className="chips">{g.items.map((s) => <i key={s}>{s}</i>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
