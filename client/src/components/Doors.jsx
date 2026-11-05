import { useRef, useState } from 'react';
import Split from './Split.jsx';

const COLORS = ['#7c5cff', '#ff4d8d', '#20e3b2', '#ffd24a', '#4cc9ff'];

export default function Doors({ doors }) {
  const rail = useRef(null);
  const [open, setOpen] = useState(null);
  const nudge = (d) => rail.current.scrollBy({ left: d * 340, behavior: 'smooth' });
  return (
    <section id="work" className="section" data-acc="#ff4d8d,#ffb347">
      <div className="section-head">
        <p className="eyebrow reveal">My work, one door per skill</p>
        <Split text="Magic happens behind the *doors*" />
        <p className="hint reveal">Swipe along the wall — tap a door to open it.</p>
      </div>
      <div className="rail-wrap reveal">
        <button className="arrow left" aria-label="Previous" onClick={() => nudge(-1)}>←</button>
        <div className="rail" ref={rail}>
          {doors.map((d, i) => (
            <button key={d.title} data-tilt="9" style={{ '--c': COLORS[i % COLORS.length] }}
              className={`door ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span className="door-inside">
                <p>{d.text}</p>
                <span className="chips">{d.stack.map((s) => <i key={s}>{s}</i>)}</span>
              </span>
              <span className="door-front">
                <small>{String(i + 1).padStart(2, '0')}</small>
                <b>{d.title}</b>
                <em>{d.tag}</em>
                <span className="knob" />
              </span>
            </button>
          ))}
        </div>
        <button className="arrow right" aria-label="Next" onClick={() => nudge(1)}>→</button>
      </div>
    </section>
  );
}
