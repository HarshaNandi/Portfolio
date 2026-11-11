import { useState } from 'react';
import { useClock, useToday } from '../hooks.js';

const links = [['Home', '#home'], ['Web Development', '#work'], ['Data Analytics', '#work'], ['Dashboards', '#work'], ['Data Science', '#work'], ['My story', '#story']];

export default function Header({ profile, onHire }) {
  const [open, setOpen] = useState(false);
  const time = useClock(profile.timezone);
  const today = useToday(profile.timezone);
  return (
    <header className="header">
      <div className="bar">
        <a className="brand" href="#home">{profile.name}</a>
        <nav className="links" aria-label="Primary">
          {links.map(([l, h]) => <a key={l} href={h}>{l}</a>)}
          <button onClick={onHire}>Contact</button>
        </nav>
        <div className="timepill">Local time <b>{time}</b><i>·</i>{today}</div>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Close' : 'Menu'}</button>
      </div>
      {open && (
        <nav className="menu" onClick={() => setOpen(false)}>
          {links.map(([l, h]) => <a key={l} href={h}>{l}</a>)}
          <button onClick={onHire}>Contact</button>
        </nav>
      )}
    </header>
  );
}
