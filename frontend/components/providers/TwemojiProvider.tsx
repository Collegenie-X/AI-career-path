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
  const pending = parseHydratedEmoji(window.twemoji);
  // 아직 하이드레이션 전인 <Suspense>·dynamic 경계가 남아 있으면 조금 뒤 다시 시도한다
  if (pending) scheduleRetry();
  else retryCount = 0;
}

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);

/** React가 이미 소유(하이드레이션 또는 클라이언트 생성)한 엘리먼트에는 __reactFiber$… 키가 붙어 있다 */
function isOwnedByReact(el: Element) {
  return Object.keys(el).some((key) => key.startsWith('__reactFiber$'));
}

/**
 * 이모지가 든 텍스트의 부모 중 React가 이미 소유한 것만 치환한다.
 * body 전체를 한 번에 치환하면, 늦게 하이드레이션되는 경계(예: /jobs/explore 의 Suspense·dynamic 탭)의
 * 서버 HTML까지 바뀌어 "Hydration failed"가 난다.
 * @returns 아직 하이드레이션 전이라 건너뛴 이모지가 있으면 true
 */
function parseHydratedEmoji(twemoji: NonNullable<Window['twemoji']>) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const targets = new Set<Element>();
  let pending = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || SKIP_TAGS.has(parent.tagName) || !EMOJI_PATTERN.test(node.nodeValue ?? '')) continue;
    if (isOwnedByReact(parent)) targets.add(parent);
    else pending = true;
  }
  targets.forEach((el) => twemoji.parse(el as HTMLElement, TWEMOJI_OPTIONS));
  return pending;
}

let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retryCount = 0;
const MAX_RETRIES = 20;

function scheduleRetry() {
  if (retryTimer || retryCount >= MAX_RETRIES) return;
  retryCount += 1;
  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    applyTwemoji();
  }, 500);
}

/**
 * 하이드레이션이 "전부" 끝난 뒤에 실행한다.
 *
 * 페이지 최상단 <Suspense> 안쪽 트리는 루트 커밋보다 늦게 하이드레이션되므로
 * rAF 두 번만으로는 부족하다. React의 하이드레이션 작업은 스케줄러 태스크로 돌기 때문에,
 * load 이벤트 이후 브라우저가 idle 상태가 될 때까지 기다리면 남은 경계까지 안전하게 커밋된 뒤다.
 */
function afterHydration(run: () => void) {
  if (typeof window === 'undefined') return () => {};

  let cancelled = false;
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  let frame = 0;
  let idle = 0;

  const cancel = () => {
    cancelled = true;
    timers.forEach(clearTimeout);
    if (frame) cancelAnimationFrame(frame);
    if (idle && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
    window.removeEventListener('load', onLoad);
  };

  const finish = () => {
    frame = requestAnimationFrame(() => {
      if (!cancelled) run();
    });
  };

  const whenIdle = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(finish, { timeout: 1000 });
      return;
    }
    timers.push(setTimeout(finish, 300));
  };

  function onLoad() {
    whenIdle();
  }

  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', onLoad, { once: true });

  return cancel;
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
        onReady={() => {
          afterHydration(applyTwemoji);
        }}
      />
      {children}
    </>
  );
}
