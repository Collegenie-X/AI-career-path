'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    twemoji?: {
      parse: (el: HTMLElement | string, options?: object) => string;
    };
  }
}

const TWEMOJI_OPTIONS = {
  folder: 'svg',
  ext: '.svg',
  base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/',
  className: 'twemoji',
};

function applyTwemoji() {
  if (typeof window !== 'undefined' && window.twemoji) {
    window.twemoji.parse(document.body, TWEMOJI_OPTIONS);
  }
}

function scheduleApply(delayMs = 50) {
  // Fire once after React has flushed the DOM
  const t = setTimeout(applyTwemoji, delayMs);
  return () => clearTimeout(t);
}

export function TwemojiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Re-apply after every client-side navigation
  useEffect(() => scheduleApply(50), [pathname]);

  // Also watch for dynamic content added after initial render
  useEffect(() => {
    if (typeof window === 'undefined' || !window.MutationObserver) return;

    let debounce: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(applyTwemoji, 80);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(debounce);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@twemoji/api@15.1.0/dist/twemoji.min.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => scheduleApply(300)}
      />
      {children}
    </>
  );
}
