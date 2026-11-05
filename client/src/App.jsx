import { useEffect, useRef, useState } from 'react';
import fallback from '../../server/data/profile.json';
import Loader from './components/Loader.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Doors from './components/Doors.jsx';
import Story from './components/Story.jsx';
import Projects from './components/Projects.jsx';
import Skills from './components/Skills.jsx';
import CtaBand from './components/CtaBand.jsx';
import Footer from './components/Footer.jsx';
import ContactModal from './components/ContactModal.jsx';
import Scene3D from './components/Scene3D.jsx';
import Marquee from './components/Marquee.jsx';
import Wipe from './components/Wipe.jsx';
import { useReveal } from './hooks.js';
import { useFx } from './fx.js';

export default function App() {
  const [profile, setProfile] = useState(fallback);
  const [entered, setEntered] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [wipe, setWipe] = useState('idle'); // idle | in | out
  const busy = useRef(false);

  useEffect(() => {
    fetch('/api/profile').then((r) => (r.ok ? r.json() : null)).then((p) => p && setProfile(p)).catch(() => {});
  }, []);
  useEffect(() => { document.body.style.overflow = entered && !contactOpen ? '' : 'hidden'; }, [entered, contactOpen]);
  useReveal(entered);
  useFx(entered);

  // In-page links get a curtain-wipe transition instead of a plain scroll.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      if (busy.current) return;
      busy.current = true;
      setWipe('in');
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        setWipe('out');
        setTimeout(() => { setWipe('idle'); busy.current = false; }, 750);
      }, 700);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const openContact = () => setContactOpen(true);
  const tech = ['Laravel', 'Python', 'SQL', 'Power BI', 'WordPress', 'Tableau', 'NLP', 'MySQL', 'Git'];

  return (
    <>
      <Scene3D />
      <div className="progress" />
      <div className="cursor-dot" /><div className="cursor-ring" />
      <Wipe phase={wipe} />
      {!entered && <Loader onEnter={() => setEntered(true)} />}
      <a className="skip" href="#main">Skip to content</a>
      <Header profile={profile} onHire={openContact} />
      <main id="main">
        <Hero profile={profile} onHire={openContact} />
        <Marquee items={tech} />
        <Doors doors={profile.doors} />
        <Story story={profile.story} />
        <Marquee items={['Full-stack', 'Data analytics', 'Dashboards', 'Machine learning', 'Open to work']} reverse />
        <Projects projects={profile.projects} />
        <Skills skills={profile.skills} />
        <CtaBand onHire={openContact} />
      </main>
      <Footer profile={profile} onHire={openContact} />
      {contactOpen && <ContactModal profile={profile} onClose={() => setContactOpen(false)} />}
    </>
  );
}
