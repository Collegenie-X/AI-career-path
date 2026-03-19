'use client';

import { useEffect, useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  chartDefinition: string;
}

function MermaidBlock({ chartDefinition }: MermaidBlockProps) {
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [renderErrorMessage, setRenderErrorMessage] = useState<string | null>(null);
  const mermaidChartId = useId().replace(/:/g, '-');

  useEffect(() => {
    let isCancelled = false;

    async function renderMermaidChart() {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            background: '#0f1024',
            primaryColor: '#6C5CE7',
            primaryTextColor: '#EDE9FE',
            primaryBorderColor: '#A78BFA',
            lineColor: '#8B5CF6',
            secondaryColor: '#1E1B4B',
            secondaryTextColor: '#DDD6FE',
            secondaryBorderColor: '#7C3AED',
            tertiaryColor: '#111827',
            tertiaryTextColor: '#C4B5FD',
            tertiaryBorderColor: '#6366F1',
          },
        });
        const { svg } = await mermaid.render(`dreammate-mermaid-${mermaidChartId}`, chartDefinition);
        if (!isCancelled) {
          setRenderedSvg(svg);
          setRenderErrorMessage(null);
        }
      } catch {
        if (!isCancelled) {
          setRenderedSvg('');
          setRenderErrorMessage('Mermaid 다이어그램을 렌더링하지 못했습니다.');
        }
      }
    }

    void renderMermaidChart();

    return () => {
      isCancelled = true;
    };
  }, [chartDefinition, mermaidChartId]);

  if (renderErrorMessage) {
    return <p className="text-xs text-red-300">{renderErrorMessage}</p>;
  }

  return (
    <div
      className="overflow-auto rounded-lg bg-black/30 p-2"
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
    />
  );
}

interface DreamLibraryMarkdownViewerProps {
  markdownContent: string;
}

export function DreamLibraryMarkdownViewer({ markdownContent }: DreamLibraryMarkdownViewerProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-200 prose-strong:text-white prose-headings:text-white prose-code:text-indigo-200 prose-pre:bg-black/40 prose-a:text-violet-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const className = props.className ?? '';
            const codeText = String(props.children ?? '').replace(/\n$/, '');
            if (className.includes('language-mermaid')) {
              return <MermaidBlock chartDefinition={codeText} />;
            }
            return (
              <code className={className}>
                {props.children}
              </code>
            );
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}
