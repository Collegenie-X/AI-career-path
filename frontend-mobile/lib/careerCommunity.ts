/**
 * 커리어 커뮤니티 가입 상태 저장소
 */
const SCHOOLS_KEY = 'career_joined_schools';
const GROUPS_KEY = 'career_joined_groups';

export function loadJoinedSchoolIds(): string[] {
  try {
    const raw = localStorage.getItem(SCHOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJoinedSchoolIds(ids: string[]) {
  try {
    localStorage.setItem(SCHOOLS_KEY, JSON.stringify(ids));
  } catch {}
}

export function joinSchool(schoolId: string) {
  const ids = loadJoinedSchoolIds();
  if (!ids.includes(schoolId)) {
    saveJoinedSchoolIds([...ids, schoolId]);
  }
}

export function leaveSchool(schoolId: string) {
  saveJoinedSchoolIds(loadJoinedSchoolIds().filter(id => id !== schoolId));
}

export function isJoinedSchool(schoolId: string): boolean {
  return loadJoinedSchoolIds().includes(schoolId);
}

export function loadJoinedGroupIds(): string[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJoinedGroupIds(ids: string[]) {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(ids));
  } catch {}
}

export function joinGroup(groupId: string) {
  const ids = loadJoinedGroupIds();
  if (!ids.includes(groupId)) {
    saveJoinedGroupIds([...ids, groupId]);
  }
}

export function leaveGroup(groupId: string) {
  saveJoinedGroupIds(loadJoinedGroupIds().filter(id => id !== groupId));
}

export function isJoinedGroup(groupId: string): boolean {
  return loadJoinedGroupIds().includes(groupId);
}
