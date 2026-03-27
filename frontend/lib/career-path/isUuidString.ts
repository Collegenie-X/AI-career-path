/** Django UUID primary key 형식인지 검사 (임시 `from-template-...` id 제외용) */
export function isUuidString(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim()
  );
}
