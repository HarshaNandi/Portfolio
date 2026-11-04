import { useRef, useState } from 'react';

export default function Doors({ doors }) {
  const rail = useRef(null);
  const [open, setOpen] = useState(null);
  const nudge = (d) => rail.current.scrollBy({ left: d * 340, behavior: 'smooth' });
  return (
    <section id="work" className="section">
      <div className="section-head reveal">
        <p className="eyebrow">My work, one door per skill</p>
        <h2>Magic happens behind the <em>doors</em></h2>
        <p className="hint">Swipe along the wall — tap a door to open it.</p>
      </div>
      <div className="rail-wrap">
        <button className="arrow left" aria-label="Previous" onClick={() => nudge(-1)}>←</button>
        <div className="rail" ref={rail}>
          {doors.map((d, i) => (
            <button key={d.title} className={`door ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span className="door-front">
                <small>{String(i + 1).padStart(2, '0')}</small>
                <b>{d.title}</b>
                <em>{d.tag}</em>
                <span className="knob" />
              </span>
              <span className="door-inside">
                <p>{d.text}</p>
                <span className="chips">{d.stack.map((s) => <i key={s}>{s}</i>)}</span>
              </span>
            </button>
          ))}
        </div>
        <button className="arrow right" aria-label="Next" onClick={() => nudge(1)}>→</button>
      </div>
    </section>
  );
}
