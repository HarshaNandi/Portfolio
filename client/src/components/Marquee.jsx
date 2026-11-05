export default function Marquee({ items, reverse }) {
  const row = [...items, ...items];
  return (
    <div className={`marquee ${reverse ? 'rev' : ''}`} aria-hidden="true">
      <div className="track">
        {[0, 1].map((k) => <div key={k} className="seg">{row.map((t, i) => <span key={i}>{t}<b>✦</b></span>)}</div>)}
      </div>
    </div>
  );
}
