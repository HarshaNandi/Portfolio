// Full-screen curtain that sweeps across when navigating between sections.
export default function Wipe({ phase }) {
  return (
    <div className={`wipe ${phase}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--i': i }} />)}
    </div>
  );
}
