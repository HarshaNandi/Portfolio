import { useState } from 'react';
import { useClock } from '../hooks.js';

const links = [['Home', '#home'], ['Skills', '#work'], ['My story', '#story'], ['Projects', '#projects'], ['Toolbox', '#toolbox']];

export default function Header({ profile, onHire }) {
  const [open, setOpen] = useState(false);
  const time = useClock(profile.timezone);
  return (
    <header className="header">
      <a className="brand" href="#home">{profile.name}</a>
      <nav className="top-links" aria-label="Primary">
        {links.slice(1, 4).map(([l, h]) => <a key={h} href={h}>{l}</a>)}
      </nav>
      <div className="header-right">
        <span className="clock">Kolkata {time}</span>
        <button className="btn small" onClick={onHire}>Hire me</button>
        <button className="btn small ghost" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Close' : 'Menu'}</button>
      </div>
      {open && (
        <nav className="menu" onClick={() => setOpen(false)}>
          {links.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
          <button onClick={onHire}>Contact</button>
        </nav>
      )}
    </header>
  );
}
