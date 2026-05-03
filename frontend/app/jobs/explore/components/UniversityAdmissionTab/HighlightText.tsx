import { GlossaryText } from './GlossaryText';

/**
 * 호환용 래퍼.
 * `==text==`는 형광펜으로, 등록된 약자(IB·EE·CAS·HL·TOK·AP·SAT·SKY 등)는
 * 점선 밑줄 + 호버/탭 시 말풍선 툴팁으로 렌더링한다.
 */
export function HighlightText({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return <GlossaryText className={className}>{children}</GlossaryText>;
}
