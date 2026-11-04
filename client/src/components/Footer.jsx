import { useClock } from '../hooks.js';

export default function Footer({ profile, onHire }) {
  const time = useClock(profile.timezone);
  return (
    <>
      <footer className="footer">
        <div>
          <h4>Work</h4>
          <a href="#work">Web developer</a><a href="#work">Data analyst</a><a href="#work">Dashboard builder</a><a href="#work">Data scientist</a>
        </div>
        <div>
          <h4>Navigate</h4>
          <a href="#home">Home</a><a href="#story">My story</a><a href="#projects">Projects</a>
          <button onClick={onHire}>Contact</button>
        </div>
        <div>
          <h4>Connect</h4>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
        <div>
          <h4>Status</h4>
          <span>Available for work</span><span>Remote-first</span><span>{profile.location}</span><span>Local time {time}</span>
        </div>
        <p className="copy">© {new Date().getFullYear()} {profile.name} <a href="#home">Back to top ↑</a></p>
      </footer>
      <button className="floating" onClick={onHire}>Hire me →</button>
    </>
  );
}
