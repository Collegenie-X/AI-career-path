import React from 'react';

const HIGHLIGHT_STYLE: React.CSSProperties = {
  background: 'linear-gradient(transparent 72%, rgba(236,72,153,0.45) 72%, rgba(236,72,153,0.45) 92%, transparent 92%)',
  color: '#fff',
  fontWeight: 600,
  padding: '0 1px',
};

export function renderHighlightedText(text: string): React.ReactNode {
  const parts = text.split(/==(.*?)==/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={HIGHLIGHT_STYLE}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
