import type { ReactNode } from 'react';

/**
 * ==text== 마크업을 형광펜 효과로 렌더링합니다.
 * 모든 텍스트는 최소 12px(text-xs) 이상으로 표시됩니다.
 */
export function HighlightText({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  const parts = parseHighlight(children);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            key={i}
            style={{
              background: 'linear-gradient(120deg, rgba(250,204,21,0.35) 0%, rgba(250,204,21,0.55) 100%)',
              borderRadius: '3px',
              padding: '0 3px',
              color: 'inherit',
              fontWeight: 700,
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
            }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}

function parseHighlight(text: string): Array<{ text: string; highlight: boolean }> {
  const result: Array<{ text: string; highlight: boolean }> = [];
  const regex = /==([^=]+)==/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    result.push({ text: match[1], highlight: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), highlight: false });
  }

  return result;
}
