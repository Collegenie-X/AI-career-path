/**
 * 커리어 패스 영역 — 오른쪽 디테일에서 「확대」 시 바텀시트 다이얼로그 너비 (px).
 * 공통 컴포넌트·다이얼로그에서 동일 값 사용.
 */
export const CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_PX = 560 as const;

/** Tailwind arbitrary class — CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_PX 와 동기화 */
export const CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_CLASS = 'max-w-[580px]' as const;

/** 확대 바텀시트(타임라인 상세) — `createPortal` 로 body 에 붙는 레이어 */
export const CAREER_PATH_EXPAND_DIALOG_Z_INDEX = 9999 as const;

/**
 * 확대 다이얼로그보다 위에 열려야 하는 중첩 UI (공유 설정, 커리어 패스 편집 빌더 등).
 * 확대 셸보다 낮으면 클릭해도 화면에 안 보입니다.
 */
export const CAREER_PATH_NESTED_OVERLAY_Z_INDEX = 10050 as const;
