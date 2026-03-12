'use client';

import { useEffect, useMemo, useRef } from 'react';

type MermaidGlobal = {
  initialize: (options: { startOnLoad: boolean; theme: string; securityLevel: string }) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

declare global {
  interface Window {
    mermaid?: MermaidGlobal;
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseMarkdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  let html = '';
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith('```mermaid')) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      const code = escapeHtml(codeLines.join('\n'));
      html += `<div class="mermaid-source" data-mermaid-code="${code}"></div>`;
      index += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
      index += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
      index += 1;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3>${escapeHtml(line.slice(4))}</h3>`;
      index += 1;
      continue;
    }

    const nextLine = lines[index + 1] ?? '';
    const isTableHeader = line.includes('|') && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(nextLine);
    if (isTableHeader) {
      const tableRows: string[] = [line];
      index += 2;
      while (index < lines.length && lines[index].includes('|')) {
        tableRows.push(lines[index]);
        index += 1;
      }
      const [headerRow, ...bodyRows] = tableRows;
      const headers = headerRow.split('|').map((cell) => cell.trim()).filter(Boolean);
      html += '<table><thead><tr>';
      headers.forEach((header) => {
        html += `<th>${escapeHtml(header)}</th>`;
      });
      html += '</tr></thead><tbody>';
      bodyRows.forEach((row) => {
        const cells = row.split('|').map((cell) => cell.trim()).filter(Boolean);
        html += '<tr>';
        cells.forEach((cell) => {
          html += `<td>${escapeHtml(cell)}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      continue;
    }

    if (line.startsWith('- ')) {
      html += '<ul>';
      while (index < lines.length && lines[index].startsWith('- ')) {
        html += `<li>${escapeHtml(lines[index].slice(2))}</li>`;
        index += 1;
      }
      html += '</ul>';
      continue;
    }

    if (line.trim().length === 0) {
      html += '<br />';
      index += 1;
      continue;
    }

    html += `<p>${escapeHtml(line)}</p>`;
    index += 1;
  }

  return html;
}

async function ensureMermaidScriptLoaded(): Promise<MermaidGlobal | null> {
  if (typeof window === 'undefined') return null;
  if (window.mermaid) return window.mermaid;

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-mermaid-runtime="true"]');
  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener('load', () => resolve(window.mermaid ?? null), { once: true });
      existingScript.addEventListener('error', () => resolve(null), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    script.async = true;
    script.dataset.mermaidRuntime = 'true';
    script.onload = () => resolve(window.mermaid ?? null);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

export function ResourceMarkdownViewer({ markdownText }: { markdownText: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const html = useMemo(() => parseMarkdownToHtml(markdownText), [markdownText]);

  useEffect(() => {
    const renderMermaid = async () => {
      const container = containerRef.current;
      if (!container) return;
      const mermaid = await ensureMermaidScriptLoaded();
      if (!mermaid) return;

      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      const blocks = Array.from(container.querySelectorAll<HTMLElement>('.mermaid-source'));
      await Promise.all(
        blocks.map(async (block, index) => {
          const rawCode = block.dataset.mermaidCode ?? '';
          const code = rawCode
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>')
            .replaceAll('&amp;', '&')
            .replaceAll('&quot;', '"')
            .replaceAll('&#39;', "'");
          try {
            const { svg } = await mermaid.render(`mermaid-${Date.now()}-${index}`, code);
            block.innerHTML = svg;
            block.classList.remove('mermaid-source');
          } catch {
            block.innerHTML = `<pre style="white-space:pre-wrap;color:#fca5a5;">Mermaid 렌더 실패\n${escapeHtml(code)}</pre>`;
          }
        })
      );
    };
    void renderMermaid();
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="prose prose-invert max-w-none text-[12px] leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/20 [&_th]:p-2 [&_td]:border [&_td]:border-white/10 [&_td]:p-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
