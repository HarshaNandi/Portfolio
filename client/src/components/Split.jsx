// Word-by-word masked reveal. Wrap a word in *asterisks* to render it as the accent italic.
export default function Split({ text, as: Tag = 'h2', className = '' }) {
  let i = 0;
  const words = text.split(' ').map((tok) => {
    const m = tok.match(/^(.*?)\*(.+?)\*(.*)$/);
    const idx = i++;
    return (
      <span key={idx}>
        <span className="w"><span style={{ '--i': idx }}>{m ? <>{m[1]}<em>{m[2]}</em>{m[3]}</> : tok}</span></span>{' '}
      </span>
    );
  });
  return <Tag className={`split reveal ${className}`}>{words}</Tag>;
}
