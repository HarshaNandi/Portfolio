import { useEffect } from 'react';

// Global effects: section colour themes, scroll progress, custom cursor, 3D tilt, magnetic buttons.
export function useFx(entered) {
  useEffect(() => {
    if (!entered) return;
    const root = document.documentElement;
    const setAcc = (str) => {
      const [a, b] = str.split(',');
      root.style.setProperty('--acc', a); root.style.setProperty('--acc2', b);
      window.__acc = [a, b];
    };
    setAcc('#6c4cff,#ff3d8b');
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setAcc(e.target.dataset.acc)),
      { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('[data-acc]').forEach((s) => io.observe(s));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const max = root.scrollHeight - innerHeight;
        root.style.setProperty('--p', max > 0 ? scrollY / max : 0);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const fine = matchMedia('(pointer:fine)').matches;
    const dot = document.querySelector('.cursor-dot'), ring = document.querySelector('.cursor-ring');
    let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy, raf;
    const follow = () => {
      rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
      if (ring) ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(follow);
    };
    if (fine) follow();

    const onMove = (e) => {
      cx = e.clientX; cy = e.clientY;
      if (dot) dot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      const hot = e.target.closest?.('a,button,[data-tilt]');
      ring?.classList.toggle('hot', !!hot);
      const sp = e.target.closest?.('.proj,.skill-group,.tl-card');
      if (sp) { const r = sp.getBoundingClientRect(); sp.style.setProperty('--mx', `${e.clientX - r.left}px`); sp.style.setProperty('--my', `${e.clientY - r.top}px`); }
      const t = e.target.closest?.('[data-tilt]');
      if (t) {
        const r = t.getBoundingClientRect(), k = Number(t.dataset.tilt) || 10;
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        t.style.transform = `perspective(900px) rotateY(${x * k * 2}deg) rotateX(${-y * k * 2}deg) translateZ(14px)`;
        t.classList.add('tilting');
      }
      const b = e.target.closest?.('.btn,.floating');
      if (b) {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      }
    };
    const onOut = (e) => {
      const t = e.target.closest?.('[data-tilt],.btn,.floating');
      if (t && !t.contains(e.relatedTarget)) { t.style.transform = ''; t.classList.remove('tilting'); }
    };
    if (fine) { document.addEventListener('pointermove', onMove); document.addEventListener('pointerout', onOut); }
    onScroll();
    return () => {
      io.disconnect(); cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerout', onOut);
    };
  }, [entered]);
}
