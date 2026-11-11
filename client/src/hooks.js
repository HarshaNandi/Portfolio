import { useEffect, useState } from 'react';

export function useClock(timezone) {
  const fmt = () => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone })
    .format(new Date()).replace(' ', '').toLowerCase();
  const [t, setT] = useState(fmt);
  useEffect(() => { const id = setInterval(() => setT(fmt()), 15000); return () => clearInterval(id); }, [timezone]);
  return t;
}

export function useToday(timezone) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(new Date());
}

export function useReveal(ready) {
  useEffect(() => {
    if (!ready) return;
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
}
