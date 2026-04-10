'use client';

import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    title: '만랩 회사',
    links: [
      { label: '대표자: 김종필', href: '#' },
      { label: '사업자번호: 760-57-00294', href: '#' },
      // { label: '통신판매업: 2025-서울강남-0001', href: '#' },
      { label:'주소: 경기도 하남시 풍산동 미사강변서로 16,하우스디스마트벨리 10층 1046호', href: '#' },
      { label: '대표번호: 010-2708-0051', href: '#' },
    ],
  },
  {
    title: '고객센터',
    links: [
      { label: '상담시간', href: '#' },
      { label: '평일 09:00~18:00', href: '#' },
      { label: '(점심시간 12:30~13:30)', href: '#' },
      // { label: '02-1234-5678', href: '#' },
      { label: 'support@aicareerpath.com', href: 'mailto:support@aicareerpath.com' },
    ],
  },
  {
    title: '약관 및 정책',
    links: [
      { label: '이용약관', href: '/terms' },
      { label: '개인정보취급방침', href: '/privacy' },
      { label: '이메일무단수집거부', href: '/email-policy' },
      { label: '법적 고지', href: '/legal' },
    ],
  },
] as const;

export function WebFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black">
      <div className="web-container">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 min-[720px]:grid-cols-3 gap-8 min-[980px]:gap-12 py-12 px-4 min-[720px]:px-8">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <span className="text-sm text-white/50">{link.label}</span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white/80 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 px-4 min-[720px]:px-8 py-6">
          <p className="text-sm text-white/40 leading-relaxed">
            © {currentYear} AI CareerPath. All rights reserved.
          </p>
          <p className="text-xs text-white/30 mt-2 leading-relaxed">
            본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 
            이를 위반시 정보통신망법에 의해 형사 처벌됨을 유념하시기 바랍니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
