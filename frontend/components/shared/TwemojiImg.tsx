'use client';

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg';

function toCodePoint(emoji: string): string {
  const codePoints: string[] = [];
  let i = 0;
  const chars = [...emoji];
  for (const ch of chars) {
    const cp = ch.codePointAt(0);
    if (!cp) continue;
    if (cp === 0xfe0f) continue; // strip variation selector-16
    codePoints.push(cp.toString(16));
    i++;
  }
  return codePoints.join('-');
}

interface TwemojiImgProps {
  emoji: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export function TwemojiImg({ emoji, size = 32, className = '', style, alt }: TwemojiImgProps) {
  const cp = toCodePoint(emoji);
  const src = `${TWEMOJI_BASE}/${cp}.svg`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? emoji}
      width={size}
      height={size}
      draggable={false}
      className={`select-none inline-block ${className}`}
      style={{ imageRendering: 'crisp-edges', ...style }}
      onError={(e) => {
        // Fallback: hide the broken img and show native emoji
        const el = e.currentTarget;
        el.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = emoji;
        span.style.fontSize = `${size}px`;
        span.style.lineHeight = '1';
        el.parentNode?.insertBefore(span, el);
      }}
    />
  );
}
