import { useClock } from '../hooks.js';

export default function Footer({ profile, onHire }) {
  const time = useClock(profile.timezone);
  return (
    <footer className="footer">
      <div className="foot-grid">
        <div>
          <h4>Work</h4>
          <div className="cols">
            {['Web Development', 'Data Analytics', 'Dashboards', 'Data Science', 'Problem Solving'].map((l) => <a key={l} href="#work">{l}</a>)}
          </div>
        </div>
        <div>
          <h4>Navigate</h4>
          <a href="#home">Home</a>
          <a href="#story">My story</a>
          <a href="#projects">Projects</a>
          <button onClick={onHire}>Contact</button>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
        <div>
          <h4>Status</h4>
          <span>Available for work</span>
          <span>Remote-first, worldwide</span>
          <span>Local time {time}</span>
        </div>
      </div>
      <p className="copy">
        <span>© {new Date().getFullYear()} {profile.name}. Designed and built by {profile.firstName}.</span>
        <a href="#home">Back to top ↑</a>
      </p>
    </footer>
  );
}
