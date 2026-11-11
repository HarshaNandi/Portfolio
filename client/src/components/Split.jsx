import { Fragment } from 'react';

// Word-by-word masked reveal. *Wrap words in asterisks* for the accent style; "|" is a line break.
export default function Split({ text, as: Tag = 'h2', className = '' }) {
  let i = 0, em = false;
  const out = text.split(' ').map((tok, k) => {
    if (tok === '|') return <br key={`b${k}`} />;
    const idx = i++;
    const nodes = tok.split('*').map((seg, j) => {
      if (j > 0) em = !em;
      if (!seg) return null;
      return em ? <em key={j}>{seg}</em> : <Fragment key={j}>{seg}</Fragment>;
    });
    return (
      <span key={`w${k}`}>
        <span className="w"><span style={{ '--i': idx }}>{nodes}</span></span>{' '}
      </span>
    );
  });
  return <Tag className={`split reveal ${className}`}>{out}</Tag>;
}
