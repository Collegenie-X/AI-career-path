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

/**
 * twemoji는 React가 소유한 DOM을 직접 치환한다(이모지 텍스트 → <img class="twemoji">).
 * 하이드레이션이 끝나기 전에 실행되면 서버 HTML과 클라이언트 DOM이 어긋나
 * "Hydration failed because the server rendered HTML didn't match the client"가 발생한다.
 * 그래서 모든 실행은 반드시 "마운트 이후(=하이드레이션 커밋 이후)"에만 시작한다.
 */
function applyTwemoji() {
  if (typeof window === 'undefined' || !window.twemoji) return;
  window.twemoji.parse(document.body, TWEMOJI_OPTIONS);
}

/** 하이드레이션 커밋이 브라우저에 반영된 다음 프레임까지 기다린다 */
function afterHydration(run: () => void) {
  if (typeof window === 'undefined') return () => {};
  let cancelled = false;
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      if (!cancelled) run();
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}

export function TwemojiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 최초 마운트 + 클라이언트 내비게이션마다 재적용 (항상 하이드레이션 이후)
  useEffect(() => afterHydration(applyTwemoji), [pathname]);

  // 이후 동적으로 추가되는 콘텐츠 감시 — 관찰 시작도 하이드레이션 이후로 미룬다
  useEffect(() => {
    if (typeof window === 'undefined' || !window.MutationObserver) return;

    let debounce: ReturnType<typeof setTimeout>;
    let observer: MutationObserver | undefined;

    const cancel = afterHydration(() => {
      observer = new MutationObserver(() => {
        clearTimeout(debounce);
        debounce = setTimeout(applyTwemoji, 80);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      cancel();
      clearTimeout(debounce);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      {/*
        lazyOnload + onReady: 스크립트가 하이드레이션 도중에 로드되어
        body를 먼저 치환해 버리는 경쟁 상태를 없앤다.
      */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@twemoji/api@15.1.0/dist/twemoji.min.js"
        crossOrigin="anonymous"
        strategy="lazyOnload"
        onReady={() => afterHydration(applyTwemoji)}
      />
      {children}
    </>
  );
}
