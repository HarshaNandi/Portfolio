import { useEffect, useState } from 'react';
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
import { useReveal } from './hooks.js';

export default function App() {
  const [profile, setProfile] = useState(fallback);
  const [entered, setEntered] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then((r) => (r.ok ? r.json() : null)).then((p) => p && setProfile(p)).catch(() => {});
  }, []);
  useEffect(() => { document.body.style.overflow = entered && !contactOpen ? '' : 'hidden'; }, [entered, contactOpen]);
  useReveal(entered);

  const openContact = () => setContactOpen(true);

  return (
    <>
      {!entered && <Loader onEnter={() => setEntered(true)} />}
      <a className="skip" href="#main">Skip to content</a>
      <Header profile={profile} onHire={openContact} />
      <main id="main">
        <Hero profile={profile} onHire={openContact} />
        <Doors doors={profile.doors} />
        <Story story={profile.story} />
        <Projects projects={profile.projects} />
        <Skills skills={profile.skills} />
        <CtaBand onHire={openContact} />
      </main>
      <Footer profile={profile} onHire={openContact} />
      {contactOpen && <ContactModal profile={profile} onClose={() => setContactOpen(false)} />}
    </>
  );
}
