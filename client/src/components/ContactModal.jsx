import { useEffect, useState } from 'react';

export default function ContactModal({ profile, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', website: '' });
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent('Portfolio enquiry from ' + form.name)}&body=${encodeURIComponent(form.message + '\n\n' + form.name + '\n' + form.phone)}`;

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'Something went wrong.');
      setState('done');
    } catch (ex) { setErr(ex.message); setState('error'); }
  };

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Contact">
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        {state === 'done' ? (
          <div className="done">
            <h3>Message sent</h3>
            <p>Thanks {form.name.split(' ')[0]} — I'll get back to you within a day.</p>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>Let's talk</h3>
            <label>Name<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
            <label>Email<input required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
            <label>Phone<input value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
            <label>What do you need?<textarea required rows="4" value={form.message} onChange={set('message')} /></label>
            <label className="hp" aria-hidden="true">Leave this empty<input tabIndex="-1" autoComplete="off" value={form.website} onChange={set('website')} /></label>
            {state === 'error' && <p className="err">{err} <a href={mailto}>Email me instead</a></p>}
            <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
